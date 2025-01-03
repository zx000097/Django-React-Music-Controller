from django.shortcuts import render
from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse

from .models import Room
from .serializers import RoomSerializer, CreateRoomSerializer, UpdateRoomSerializer


class RoomView(generics.ListAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer


class GetRoom(generics.RetrieveAPIView):
    serializer_class = RoomSerializer
    lookup_url_kwarg = "code"

    def get(self, request):
        code = request.GET.get(self.lookup_url_kwarg)
        if code is not None:
            room = generics.get_object_or_404(Room, code=code)
            data = RoomSerializer(room).data
            data["is_host"] = self.request.session.session_key == room.host
            return Response(data, status=status.HTTP_200_OK)
        return Response(
            {"Bad Request": "Code parameter not found in request"},
            status=status.HTTP_400_BAD_REQUEST,
        )


class UserInRoom(generics.GenericAPIView):
    def get(self, request):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        data = {"code": self.request.session.get("room_code")}
        return JsonResponse(data, status=status.HTTP_200_OK)


class LeaveRoom(generics.GenericAPIView):
    def post(self, request):
        if "room_code" in self.request.session:
            self.request.session.pop("room_code")
            host_id = self.request.session.session_key
            try:
                room = Room.objects.get(host=host_id)
                room.delete()
            except Room.DoesNotExist:
                pass
        return Response({"Message": "Success"}, status=status.HTTP_200_OK)


class JoinRoom(generics.GenericAPIView):
    lookup_url_kwarg = "code"

    def post(self, request):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        code = request.data.get(self.lookup_url_kwarg)
        if code != None:
            room_result = generics.get_object_or_404(Room, code=code)
            self.request.session["room_code"] = code
            return Response({"message": "Room Joined!"}, status=status.HTTP_200_OK)

        return Response(
            {"Bad Request": "Invalid post data, did not find a code key!"},
            status=status.HTTP_400_BAD_REQUEST,
        )


class CreateRoomView(generics.CreateAPIView):
    serializer_class = CreateRoomSerializer

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            guest_can_pause = serializer.data.get("guest_can_pause")
            votes_to_skip = serializer.data.get("votes_to_skip")
            host = self.request.session.session_key
            try:
                room = Room.objects.get(host=host)
                room.guest_can_pause = guest_can_pause
                room.votes_to_skip = votes_to_skip
                room.save(update_fields=["guest_can_pause", "votes_to_skip"])
                self.request.session["room_code"] = room.code
                return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)
            except Room.DoesNotExist:
                room = Room(
                    host=host,
                    guest_can_pause=guest_can_pause,
                    votes_to_skip=votes_to_skip,
                )
                self.request.session["room_code"] = room.code
                room.save()
                return Response(
                    RoomSerializer(room).data, status=status.HTTP_201_CREATED
                )
        return Response(
            {"Bad Request": "Invlaid data..."}, status=status.HTTP_400_BAD_REQUEST
        )


class UpdateView(generics.GenericAPIView):
    serializer_class = UpdateRoomSerializer

    def patch(self, request):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            guest_can_pause = serializer.data.get("guest_can_pause")
            votes_to_skip = serializer.data.get("votes_to_skip")
            code = serializer.data.get("code")
            room = generics.get_object_or_404(Room, code=code)
            user_id = self.request.session.session_key
            if room.host != user_id:
                return Response(
                    {"Msg": "You are not the host of this room"},
                    status=status.HTTP_403_FORBIDDEN,
                )

            room.guest_can_pause = guest_can_pause
            room.votes_to_skip = votes_to_skip
            room.save(update_fields=["guest_can_pause", "votes_to_skip"])
            return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)
        return Response(
            {"Bad Request": "Invalid Data..."}, status=status.HTTP_400_BAD_REQUEST
        )
