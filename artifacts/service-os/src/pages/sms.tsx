import { useState } from "react";
import { useListSmsEvents, useSendSms } from "@workspace/api-client-react";
import { Send, Bot, Phone, User, Info } from "lucide-react";
import { format } from "date-fns";

export default function SMSHub() {
  const { data, refetch } = useListSmsEvents();
  const { mutate: sendSms, isPending } = useSendSms();
  const [message, setMessage] = useState("");
  const [useAi, setUseAi] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    sendSms({
      data: {
        toNumber: "+15551234567", // Mock recipient
        body: message,
        aiGenerate: useAi
      }
    }, {
      onSuccess: () => {
        setMessage("");
        refetch();
      }
    });
  };

  // Mock grouping for UI demonstration
  const conversations = [
    { id: 1, name: "John Smith", phone: "+1 (555) 123-4567", recent: "I'll be there in 10 mins", time: "10:42 AM", unread: 0 },
    { id: 2, name: "Sarah Davis", phone: "+1 (555) 987-6543", recent: "Can we reschedule?", time: "Yesterday", unread: 1 },
    { id: 3, name: "Mike Johnson", phone: "+1 (555) 456-7890", recent: "Thanks for the great service!", time: "Mon", unread: 0 },
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col -m-4 md:-m-8">
      <div className="px-8 py-6 border-b flex items-center justify-between bg-card">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">SMS Hub</h2>
          <p className="text-sm text-muted-foreground">Manage customer communications.</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-semibold">
          <Bot className="w-4 h-4" /> AI Assistant Active
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar List */}
        <div className="w-80 border-r bg-card flex flex-col">
          <div className="p-4 border-b">
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full px-4 py-2 bg-secondary rounded-xl text-sm border-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex-1 overflow-y-auto divide-y">
            {conversations.map(conv => (
              <button key={conv.id} className={`w-full p-4 text-left hover:bg-secondary/50 transition-colors ${conv.id === 1 ? 'bg-secondary/80' : ''}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-foreground text-sm">{conv.name}</span>
                  <span className="text-xs text-muted-foreground">{conv.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground truncate pr-4">{conv.recent}</span>
                  {conv.unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shrink-0">
                      {conv.unread}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-secondary/10">
          {/* Chat Header */}
          <div className="h-16 border-b bg-card flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">John Smith</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Phone className="w-3 h-3" /> +1 (555) 123-4567
                </p>
              </div>
            </div>
            <button className="p-2 hover:bg-secondary rounded-full text-muted-foreground">
              <Info className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="flex flex-col gap-1 items-center pb-4">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Today</span>
            </div>
            
            {data?.events.slice().reverse().map(event => (
              <div key={event.id} className={`flex ${event.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-2xl p-4 ${
                  event.direction === 'outbound' 
                    ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                    : 'bg-card border shadow-sm rounded-tl-sm text-foreground'
                }`}>
                  {event.aiGenerated && event.direction === 'outbound' && (
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider mb-2 opacity-80">
                      <Bot className="w-3 h-3" /> AI Generated
                    </div>
                  )}
                  <p className="text-sm leading-relaxed">{event.body}</p>
                  <p className={`text-[10px] mt-2 ${event.direction === 'outbound' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {format(new Date(event.createdAt), "h:mm a")}
                  </p>
                </div>
              </div>
            ))}

            {/* Mock messages to fill space if empty */}
            {(!data?.events || data.events.length === 0) && (
               <div className="flex justify-start">
                 <div className="max-w-[70%] rounded-2xl p-4 bg-card border shadow-sm rounded-tl-sm text-foreground">
                   <p className="text-sm leading-relaxed">Hi, what time is the technician arriving?</p>
                   <p className="text-[10px] mt-2 text-muted-foreground">10:30 AM</p>
                 </div>
               </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-card border-t">
            <form onSubmit={handleSend} className="flex flex-col gap-3">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  <input 
                    type="checkbox" 
                    checked={useAi} 
                    onChange={e => setUseAi(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary" 
                  />
                  <Bot className="w-4 h-4" /> Use AI Reply
                </label>
              </div>
              <div className="flex items-end gap-2">
                <textarea 
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={useAi ? "Drafting response with AI... type context here." : "Type a message..."}
                  className="flex-1 bg-secondary/50 border-none rounded-2xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[60px] max-h-[120px] text-sm"
                  rows={2}
                />
                <button 
                  type="submit" 
                  disabled={isPending || !message.trim()}
                  className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 hover:bg-primary/90 hover:shadow-lg transition-all disabled:opacity-50 disabled:hover:shadow-none"
                >
                  <Send className="w-5 h-5 ml-1" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
