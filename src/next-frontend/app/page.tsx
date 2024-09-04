'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ApiGet, ApiPost } from './utils/Api';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

interface Event {
  uqid: string;
  name: string;
  description: string;
  img_link: string;
  number_of_likes: number;
}

interface Comment{
  uqid: string;
  content: string;
  event_id: string;
}

const EventList: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [newEvent, setNewEvent] = useState<Partial<Event>>({});
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<Partial<Comment>>({});
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [isNewCommentDialogOpen, setIsNewCommentDialogOpen] = useState(false);
  const [currentEventForComment, setCurrentEventForComment] = useState<string | null>(null); 
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit =10;
  const [hasMoreComments, setHasMoreComments] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const data = await ApiGet('event');
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async (eventId: string, newOffset: number = 0) => {
    setIsCommentsLoading(true);
    try {
      const data = await ApiGet(`event/${eventId}/comments?offset=${newOffset}&limit=${limit+1}`);
      const commentsToShow = data.slice(0, limit)
      setComments(commentsToShow);
      setOffset(newOffset)
      setHasMoreComments(data.length > limit);
    } catch (error) {
      console.error('Error fetching comments for event: ', error);
    } finally {
      setIsCommentsLoading(false);
    }
  };

  const handleCreateOrUpdateEvent = async () => {
    try {
      let eventToSave = { ...newEvent };
      const data = await ApiPost('event', eventToSave);
      setNewEvent({});
      setIsDialogOpen(false);
      fetchEvents(); // Refresh the list after create/update
    } catch (error) {
      console.error('Error creating/updating event:', error);
    }
  };
  
  const handleLikeEvent = async (uqid: string) => {
    try {
      await ApiPost('event/like', { uqid });
        fetchEvents();
    } catch (error) {
      console.error('Error liking event:', error);
    }
  };

  const handleCreateComment = async () => {
    if (!currentEventForComment) return;

    try {
      newComment.event_id = currentEventForComment;
      const data = await ApiPost(`event/${currentEventForComment}/comments`, newComment);
      setNewComment({});
      setIsNewCommentDialogOpen(false); // Close the new comment dialog
      fetchComments(currentEventForComment); // Refresh the comments list after adding a new comment
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!currentEventForComment) return;
    try {
      await ApiPost(`event/${currentEventForComment}/comments/remove`, { uqid: commentId });
      fetchComments(currentEventForComment);
    } catch (error) {
      console.error("Error deleting comment: ", error)
    }
  };

  const handleNextPage = () => {
    if (currentEventForComment && hasMoreComments) {
      fetchComments(currentEventForComment, offset + limit);
    }
  };

  const handlePreviousPage = () => {
    if (currentEventForComment && offset > 0) {
      fetchComments(currentEventForComment, offset - limit);
    }
  };

  const EventSkeleton = () => (
    <div className="w-full max-w-md mb-6">
      <Skeleton className="w-full h-56 rounded-xl" />
      <Skeleton className="w-3/4 h-6 mt-2" />
      <Skeleton className="w-full h-4 mt-2" />
      <div className="flex justify-between items-center mt-2">
        <Skeleton className="w-20 h-8" />
        <Skeleton className="w-20 h-8" />
      </div>
    </div>
  );

  return (
    <div className="relative p-6">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            className="bg-[#970fff] text-white"
            onClick={() => setNewEvent({})} // Reset newEvent when opening to create
          >
            Create New Event
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{newEvent.uqid ? 'Edit Event' : 'Create New Event'}</DialogTitle>
            <DialogDescription>
              Fill in the details for your event.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input
                id="name"
                value={newEvent.name || ''}
                onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                className="col-span-3 bg-gray-800 border-[#970fff] text-white"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Input
                id="description"
                value={newEvent.description || ''}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                className="col-span-3 bg-gray-800 border-[#970fff] text-white"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="img_link" className="text-right">Image URL</Label>
              <Input
                id="img_link"
                value={newEvent.img_link || ''}
                onChange={(e) => setNewEvent({ ...newEvent, img_link: e.target.value })}
                className="col-span-3 bg-gray-800 border-[#970fff] text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={handleCreateOrUpdateEvent}
              disabled={!newEvent.name || !newEvent.description || !newEvent.img_link}
              className="bg-[#970fff] text-white"
            >
              {newEvent.uqid ? 'Update Event' : 'Create Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCommentDialogOpen} onOpenChange={setIsCommentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {isCommentsLoading ? (
              <p>Loading comments...</p>
            ) : comments.length > 0 ? (
              <ul className="list-disc ml-5 mt-2">
                {comments.map((comment) => (
                  <li key={comment.uqid} className="text-white text-opacity-80 flex justify-between items-center">
                    <span>{comment.content}</span>
                    <div>
                      <Button
                        onClick={() => {
                          setNewComment(comment);
                          setIsNewCommentDialogOpen(true);
                        }}
                        className="bg-green-500 text-white mr-2 mb-2"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteComment(comment.uqid)}
                        className="bg-red-500 text-white"
                      >
                        Delete
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No comments yet.</p>
            )}
          </div>
          <DialogFooter>
          <div className="flex justify-between mt-4">
            <Button
              onClick={handlePreviousPage}
              disabled={offset === 0} // Disable if on the first page
              className="bg-gray-500 text-white mr-20"
            >
              Previous
            </Button>
            <Button
              onClick={handleNextPage}
              disabled={!hasMoreComments} // Disable if no more comments to load
              className="bg-gray-500 text-white mr-20"
            >
              Next
            </Button>
            <Button 
              onClick={() => setIsNewCommentDialogOpen(true)}
              className="bg-blue-500 text-white"
            >
              Add Comment
            </Button>
          </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isNewCommentDialogOpen} onOpenChange={setIsNewCommentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{newComment.uqid ? 'Edit Comment' : 'Add Comment'}</DialogTitle>
            <DialogDescription>
              Enter your comment below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="comment" className="text-right">Comment</Label>
              <Input
                id="comment"
                value={newComment.content || ''}
                onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
                className="col-span-3 bg-gray-800 border-[#970fff] text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={handleCreateComment}
              disabled={!newComment.content}
              className="bg-[#970fff] text-white"
            >
              {newComment.uqid ? 'Update Comment' : 'Add Comment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col items-center mt-12">
        {isLoading ? (
          Array(3).fill(null).map((_, index) => <EventSkeleton key={index} />)
        ) : events.length === 0 ? (
          <div>No events found.</div>
        ) : (
          events.map((event) => (
            <div className="w-full max-w-md mb-6" key={event.uqid}>
              <div className="relative w-full rounded-xl overflow-hidden" style={{ paddingTop: "56.25%" }}>
                <Image
                  src={event.img_link}
                  alt={event.name}
                  fill
                  style={{ objectFit: "cover" }}
                  className="rounded-xl border border-gray-500"
                />
              </div>
              <div className="mt-2">
                <h3 className="font-bold text-lg">{event.name}</h3>
                <p className="text-sm text-white text-opacity-60">{event.description}</p>
                <div className="flex justify-between items-center mt-2">
                  <Button
                    onClick={() => handleLikeEvent(event.uqid)}
                    className="bg-blue-500 text-white"
                    aria-label={`Like event: ${event.name}`}
                  >
                    Like ({event.number_of_likes})
                  </Button>
                  <Button
                    onClick={() => {
                      setNewEvent(event);
                      setIsDialogOpen(true);
                    }}
                    className="bg-green-500 text-white"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => {
                      setCurrentEventForComment(event.uqid);
                      fetchComments(event.uqid); // Fetch comments for the selected event
                      setIsCommentDialogOpen(true); // Open the comments dialog
                    }}
                    className="bg-yellow-500 text-white"
                  >
                    View Comments
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventList;