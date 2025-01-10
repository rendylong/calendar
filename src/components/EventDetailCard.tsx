import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  Clock,
  MapPin,
  Users,
  User,
  Pencil,
  Trash2,
  X,
  CalendarCheck,
  CalendarX,
  CalendarClock,
  Tag
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Event {
  id: number;
  uid: string;
  title: string;
  date: string;
  time: string;
  endTime: string;
  description: string;
  location?: string;
  user: string;
  guests: string[];
  status: 'CONFIRMED' | 'TENTATIVE' | 'CANCELLED';
  category?: string;
  priority?: number;
  timezone?: string;
}

interface EventDetailCardProps {
  event: Event;
  onEdit?: () => void;
  onDelete?: () => void;
  onClose?: () => void;
}

const StatusIcon = ({ status }: { status: Event['status'] }) => {
  switch (status) {
    case 'CONFIRMED':
      return <CalendarCheck className="h-4 w-4" />;
    case 'TENTATIVE':
      return <CalendarClock className="h-4 w-4" />;
    case 'CANCELLED':
      return <CalendarX className="h-4 w-4" />;
  }
};

export default function EventDetailCard({ event, onEdit, onDelete, onClose }: EventDetailCardProps) {
  const handleDelete = () => {
    if (onDelete) {
      onDelete();
      toast.success('予定を削除しました');
    }
  };

  return (
    <Card className="w-full max-w-2xl bg-white shadow-lg">
      <CardHeader className="pb-4 relative">
        <div className="absolute right-6 top-6 flex items-center gap-2">
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              className="h-9 w-9 text-gray-500 hover:text-blue-600"
            >
              <Pencil className="h-5 w-5" />
              <span className="sr-only">編集</span>
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              className="h-9 w-9 text-gray-500 hover:text-red-600"
            >
              <Trash2 className="h-5 w-5" />
              <span className="sr-only">削除</span>
            </Button>
          )}
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-9 w-9 text-gray-500 hover:text-gray-900"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">閉じる</span>
            </Button>
          )}
        </div>

        <div className="pr-32">
          <CardTitle className="text-2xl font-bold mb-4">{event.title}</CardTitle>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-base">
              <CalendarDays className="h-5 w-5 text-gray-500 flex-shrink-0" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
              <div>
                <div>{event.time} - {event.endTime}</div>
                {event.timezone && (
                  <div className="text-sm text-gray-500 mt-0.5">{event.timezone}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {event.location && (
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
            <span className="text-base">{event.location}</span>
          </div>
        )}

        {event.description && (
          <div className="border-t pt-6">
            <p className="text-base leading-relaxed whitespace-pre-wrap text-gray-700">
              {event.description}
            </p>
          </div>
        )}

        <div className="border-t pt-6 space-y-4">
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm text-gray-500 mb-1">主催者</div>
              <div className="text-base">{event.user}</div>
            </div>
          </div>

          {event.guests.length > 0 && (
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm text-gray-500 mb-1">参加者 ({event.guests.length}名)</div>
                <div className="space-y-2">
                  {event.guests.map((guest, index) => (
                    <div key={index} className="text-base">
                      {guest}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3 items-center border-t pt-6">
          <div className="flex items-center gap-2 min-w-[120px]">
            <StatusIcon status={event.status} />
            <span className={`text-sm font-medium ${
              event.status === 'CONFIRMED' ? 'text-green-700' :
              event.status === 'TENTATIVE' ? 'text-yellow-700' :
              'text-red-700'
            }`}>
              {event.status === 'CONFIRMED' ? '確定' :
               event.status === 'TENTATIVE' ? '仮' : 'キャンセル'}
            </span>
          </div>
          {event.category && (
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {event.category}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 