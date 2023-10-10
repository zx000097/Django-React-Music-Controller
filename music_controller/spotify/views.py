from django.shortcuts import render, redirect
from rest_framework.views import APIView
from pip._vendor.requests import Request, post
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import get_object_or_404

from .credentials import REDIRECT_URI, CLIENT_SECRET, CLIENT_ID
from .util import *
from api.models import Room
from .models import Vote


class AuthURL(APIView):
    def get(self, request):
        scopes = "user-read-playback-state user-modify-playback-state user-read-currently-playing"

        url = (
            Request(
                "GET",
                "https://accounts.spotify.com/authorize",
                params={
                    "scope": scopes,
                    "response_type": "code",
                    "redirect_uri": REDIRECT_URI,
                    "client_id": CLIENT_ID,
                },
            )
            .prepare()
            .url
        )

        return Response({"url": url}, status=status.HTTP_200_OK)


def spotify_callback(request):
    code = request.GET.get("code")
    error = request.GET.get("error")

    response = post(
        "https://accounts.spotify.com/api/token",
        data={
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": REDIRECT_URI,
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
        },
    ).json()

    access_token = response.get("access_token")
    token_type = response.get("token_type")
    refresh_token = response.get("refresh_token")
    expires_in = response.get("expires_in")
    error = response.get("error")

    if not request.session.exists(request.session.session_key):
        request.session.create()
    update_or_create_user_tokens(
        request.session.session_key, access_token, token_type, expires_in, refresh_token
    )

    return redirect("http://127.0.0.1:3000/")


class IsAuthenticated(APIView):
    def get(self, request):
        is_authenticated = is_spotify_authenticated(self.request.session.session_key)
        return Response({"status": is_authenticated}, status=status.HTTP_200_OK)


class CurrentSong(APIView):
    def get(self, request):
        room_code = self.request.session.get("room_code")
        room = get_object_or_404(Room, code=room_code)
        host = room.host
        endpoint = "player/currently-playing"
        response = execute_spotify_api_request(host, endpoint)
        if "error" in response or "item" not in response:
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        item = response.get("item")
        duration = item.get("duration_ms")
        progress = response.get("progress_ms")
        album_cover = item.get("album").get("images")[0].get("url")
        is_playing = response.get("is_playing")
        song_id = item.get("id")

        artist_string = ""
        for i, artist in enumerate(item.get("artists")):
            if i > 0:
                artist_string += ", "
            name = artist.get("name")
            artist_string += name

        votes = room.vote_set.all().filter(song_id=song_id)

        song = {
            "title": item.get("name"),
            "artist": artist_string,
            "duration": duration,
            "time": progress,
            "image_url": album_cover,
            "is_playing": is_playing,
            "votes": len(votes),
            "votes_required": room.votes_to_skip,
            "id": song_id,
            "can_play_pause": can_pause(self.request.session.session_key, room),
        }

        self.update_room_song(room, song_id)
        return Response(song, status=status.HTTP_200_OK)

    def update_room_song(self, room, song_id):
        if room.current_song != song_id:
            room.current_song = song_id
            room.save(update_fields=["current_song"])
            room.vote_set.all().delete()


class PauseSong(APIView):
    def put(self, response):
        room_code = self.request.session.get("room_code")
        room = get_object_or_404(Room, code=room_code)
        if can_pause(self.request.session.session_key, room):
            pause_song(room.host)
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        return Response({}, status=status.HTTP_403_FORBIDDEN)


class PlaySong(APIView):
    def put(self, response):
        room_code = self.request.session.get("room_code")
        room = get_object_or_404(Room, code=room_code)
        if can_pause(self.request.session.session_key, room):
            play_song(room.host)
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        return Response({}, status=status.HTTP_403_FORBIDDEN)


class SkipSong(APIView):
    def post(self, request):
        room_code = self.request.session.get("room_code")
        room = get_object_or_404(Room, code=room_code)
        votes = room.vote_set.all().filter(song_id=room.current_song)
        votes_needed = room.votes_to_skip

        if votes.filter(user=self.request.session.session_key):
            pass
        elif (
            self.request.session.session_key == room.host
            or len(votes) + 1 >= votes_needed
        ):
            votes.delete()
            skip_song(room.host)
        else:
            vote = Vote(
                user=self.request.session.session_key,
                room=room,
                song_id=room.current_song,
            )
            vote.save()

        return Response({}, status=status.HTTP_204_NO_CONTENT)
