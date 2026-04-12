"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Message = {
  id: string;
  content: string;
  createdAt: string | Date;
  senderId: string;
};

export default function PollingConversation({
  currentUserId,
  conversationId,
  initialMessages,
  initialOtherUserLastReadAt,
  sendMessage,
}: {
  currentUserId: string;
  conversationId: string;
  initialMessages: Message[];
  initialOtherUserLastReadAt: string | null;
  sendMessage: (formData: FormData) => Promise<void>;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [otherUserLastReadAt, setOtherUserLastReadAt] = useState<string | null>(
    initialOtherUserLastReadAt
  );
  const messageBoxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    setOtherUserLastReadAt(initialOtherUserLastReadAt);
  }, [initialOtherUserLastReadAt]);

  useEffect(() => {
    let active = true;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/conversations/${conversationId}/messages`, {
          cache: "no-store",
        });

        if (!res.ok) return;

        const data = await res.json();

        if (!active) return;

        if (Array.isArray(data?.messages)) {
          setMessages(data.messages);
        }

        if (
          typeof data?.otherUserLastReadAt === "string" ||
          data?.otherUserLastReadAt === null
        ) {
          setOtherUserLastReadAt(data.otherUserLastReadAt);
        }
      } catch {
        // ignore polling errors and try again on the next interval
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [conversationId]);

  useEffect(() => {
    if (messageBoxRef.current) {
      messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const lastMyMessage = useMemo(() => {
    const mine = [...messages].reverse().find((message) => message.senderId === currentUserId);
    return mine ?? null;
  }, [messages, currentUserId]);

  const lastMyMessageSeen = useMemo(() => {
    if (!lastMyMessage || !otherUserLastReadAt) return false;

    return new Date(otherUserLastReadAt) >= new Date(lastMyMessage.createdAt);
  }, [lastMyMessage, otherUserLastReadAt]);

  return (
    <>
      <div
        ref={messageBoxRef}
        className="rounded-[1.5rem] border border-white/60 bg-white/30 backdrop-blur-md p-4 md:p-6 min-h-[420px] max-h-[520px] overflow-y-auto shadow-inner"
      >
        {messages.length === 0 ? (
          <div className="h-full min-h-[360px] flex flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#a3b18a]/20 text-3xl">
              💬
            </div>
            <p className="text-lg font-semibold text-[#4a4a4a]">
              No messages yet
            </p>
            <p className="mt-2 text-sm text-[#8a8a8a] max-w-md">
              Start the conversation about borrowing arrangements here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const isMine = message.senderId === currentUserId;
              const isLastMyMessage = lastMyMessage?.id === message.id;

              return (
                <div
                  key={message.id}
                  className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[78%] px-4 py-3 shadow-sm ${
                      isMine
                        ? "bg-[#bc8a5f] text-white rounded-[1.5rem] rounded-br-md"
                        : "bg-white/70 text-[#4a4a4a] border border-white/60 rounded-[1.5rem] rounded-bl-md"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words text-sm md:text-[15px] leading-relaxed">
                      {message.content}
                    </p>
                    <p
                      className={`mt-2 text-[11px] ${
                        isMine ? "text-white/80" : "text-[#8a8a8a]"
                      }`}
                    >
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {isMine && isLastMyMessage && (
                    <p className="mt-1 px-1 text-[11px] text-[#8a8a8a] font-medium">
                      {lastMyMessageSeen ? "Seen" : "Sent"}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <form action={sendMessage} className="mt-5 flex flex-col gap-4">
        <textarea
          name="content"
          placeholder="Type your message..."
          className="w-full rounded-[1.5rem] border border-white/60 bg-white/50 px-5 py-4 text-[#4a4a4a] placeholder:text-[#8a8a8a] outline-none focus:border-[#bc8a5f]/50 focus:ring-2 focus:ring-[#bc8a5f]/20 backdrop-blur-md min-h-[110px] resize-none"
        />

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-[#bc8a5f] hover:bg-[#a47148] text-white font-bold rounded-full transition-all shadow-lg shadow-[#bc8a5f]/20"
          >
            Send message
          </button>
        </div>
      </form>
    </>
  );
}