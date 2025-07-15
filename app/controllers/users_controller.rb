class UsersController < ApplicationController
  before_action :require_login
  
  # GET /home/
  def index
    user = current_user
    
    if user.nil?
      return render json: { message: 'User not found' }, status: 400
    end
    
    render json: {
      username: user.username,
      points: user.points,
      isAdmin: user.is_admin
    }
  end
  
  # GET /home/user-data
  def show
    user = current_user
    
    if user.nil?
      return render json: { message: 'User not found' }, status: 400
    end
    
    # Get all bars for visited_bars display
    visited_bars = user.visited_bars.pluck(:name)
    completed_goals = user.completed_goals.pluck(:name)
    
    render json: {
      username: user.username,
      points: user.points,
      isAdmin: user.is_admin,
      visitedBars: visited_bars,
      completedGoals: completed_goals,
      currentGoal: user.current_goal
    }
  end
  # POST /home/join-event
  def join_event
    event_id = params[:eventId]
    user = current_user
    
    event = Event.find_by(id: event_id)
    unless event
      return render json: { message: 'Event not found' }, status: 404
    end
    
    # Check if event is still active
    unless event.active?
      return render json: { message: 'Cannot join a completed event' }, status: 400
    end
    
    # Check if user is already participating
    participant = EventParticipant.find_by(event: event, user: user)
    unless participant
      EventParticipant.create!(
        event: event,
        user: user,
        points: 0,
        visited_bars: [],
        completed_goals: []
      )
    end
    
    render json: { message: 'Joined event successfully' }
  end
  
  # POST /home/leave-event  
  def leave_event
    event_id = params[:eventId]
    user = current_user
    
    event = Event.find_by(id: event_id)
    unless event
      return render json: { message: 'Event not found' }, status: 404
    end
    
    participant = EventParticipant.find_by(event: event, user: user)
    if participant
      participant.destroy
    end
    
    render json: { message: 'Left event successfully' }
  end
end
