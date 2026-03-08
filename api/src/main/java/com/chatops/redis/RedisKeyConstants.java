package com.chatops.redis;

public final class RedisKeyConstants {
    private RedisKeyConstants() {}

    public static String userStatus(String userId) { return "user:" + userId + ":status"; }
    public static String unreadCount(String userId, String roomId) { return "unread:" + userId + ":" + roomId; }
    public static String roomMessages(String roomId) { return "room:" + roomId + ":messages"; }
    public static String roomTyping(String roomId) { return "room:" + roomId + ":typing"; }

    public static final int USER_STATUS_TTL = 300;
    public static final int ROOM_MESSAGES_TTL = 3600;
    public static final int ROOM_TYPING_TTL = 5;
}
