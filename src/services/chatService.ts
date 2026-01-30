import { supabase } from '../lib/supabase';

export interface Message {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file';
  file_url?: string;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url?: string;
  };
}

export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  subject?: string;
  year_level?: string;
  is_private: boolean;
  created_by: string;
  created_at: string;
}

class ChatService {
  // Get all public rooms
  async getPublicRooms(): Promise<ChatRoom[]> {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('is_private', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Get user's rooms
  async getUserRooms(userId: string): Promise<ChatRoom[]> {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select(`
        *,
        room_members!inner(user_id)
      `)
      .eq('room_members.user_id', userId);

    if (error) throw error;
    return data || [];
  }

  // Get room messages
  async getRoomMessages(roomId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        profiles (username, avatar_url)
      `)
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Send message
  async sendMessage(
    roomId: string,
    userId: string,
    content: string,
    messageType: 'text' | 'image' | 'file' = 'text',
    fileUrl?: string
  ): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        room_id: roomId,
        user_id: userId,
        content,
        message_type: messageType,
        file_url: fileUrl
      })
      .select(`
        *,
        profiles (username, avatar_url)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  // Subscribe to room messages
  subscribeToRoom(roomId: string, callback: (message: Message) => void) {
    return supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}` 
        },
        (payload) => {
          callback(payload.new as Message);
        }
      )
      .subscribe();
  }

  // Upload file to Supabase Storage
  async uploadFile(file: File, roomId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${roomId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('chat-files')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('chat-files')
      .getPublicUrl(filePath);

    return publicUrl;
  }
}

export default new ChatService();
