from django.utils import timezone
from datetime import timedelta
from pip._vendor.requests import post, put, get

from .models import SpotifyToken
from .credentials import CLIENT_ID, CLIENT_SECRET

BASE_URL = "https://api.spotify.com/v1/me/"


def get_user_token(session_id):
    try:
        user_token = SpotifyToken.objects.get(user=session_id)
        return user_token
    except SpotifyToken.DoesNotExist:
        return None


def update_or_create_user_tokens(
    session_id, access_token, token_type, expires_in, refresh_token
):
    token = get_user_token(session_id)
    expires_in = timezone.now() + timedelta(seconds=expires_in)

    if token:
        token.access_token = access_token
        token.refresh_token = refresh_token
        token.expires_in = expires_in
        token.token_type = token_type
        token.save(
            update_fields=["access_token", "refresh_token", "expires_in", "token_type"]
        )
    else:
        token = SpotifyToken(
            user=session_id,
            access_token=access_token,
            refresh_token=refresh_token,
            token_type=token_type,
            expires_in=expires_in,
        )
        token.save()


def is_spotify_authenticated(session_id):
    token = get_user_token(session_id)
    if token:
        expiry = token.expires_in
        if expiry <= timezone.now():
            refresh_spotify_token(session_id)
        return True

    return False


def refresh_spotify_token(session_id):
    refresh_token = get_user_token(session_id).refresh_token
    response = post(
        "https://accounts.spotify.com/api/token",
        data={
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
        },
    ).json()

    access_token = response.get("access_token")
    token_type = response.get("token_type")
    expires_in = response.get("expires_in")

    update_or_create_user_tokens(
        session_id, access_token, token_type, expires_in, refresh_token
    )


def can_pause(session_id, room):
    return session_id == room.host or room.guest_can_pause


def execute_spotify_api_request(session_id, endpoint, post_=False, put_=False):
    token = get_user_token(session_id)
    headers = {
        "Authorization": "Bearer " + token.access_token,
    }

    if post_:
        post(BASE_URL + endpoint, headers=headers)
    if put_:
        put(BASE_URL + endpoint, headers=headers)

    response = get(BASE_URL + endpoint, {}, headers=headers)
    try:
        return response.json()
    except Exception as e:
        return {"Error": e}


def play_song(session_id):
    return execute_spotify_api_request(session_id, "player/play", put_=True)


def pause_song(session_id):
    return execute_spotify_api_request(session_id, "player/pause", put_=True)
