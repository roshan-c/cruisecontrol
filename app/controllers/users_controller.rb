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
  
  # POST /home/visit-bar
  def visit_bar
    bar_name = params[:barName]
    user = current_user
    
    if bar_name.blank?
      return render json: { message: 'Bar name is required' }, status: 400
    end
    
    bar = Bar.find_by(name: bar_name)
    unless bar
      return render json: { message: 'Bar not found' }, status: 404
    end
    
    # Find active event participation
    participant = user.event_participants.joins(:event).where(events: { status: 'active' }).first
    if participant
      # Event-specific progress tracking
      unless participant.visited_bars.include?(bar_name)
        participant.visited_bars << bar_name
        participant.points += 10  # Award points for visiting a bar
        participant.save!
      end
      
      render json: { message: 'Bar visit recorded', points: participant.points }
    else
      # Fallback to global tracking when no active event
      unless user.visited_bars.include?(bar)
        user.visited_bars << bar
        user.points += 10  # Award points for visiting a bar
        user.save!
      end
      
      render json: { message: 'Bar visit recorded', points: user.points }
    end
  end
  
  # POST /home/complete-goal
  def complete_goal
    goal_name = params[:goalName]
    user = current_user
    
    if goal_name.blank?
      return render json: { message: 'Goal name is required' }, status: 400
    end
    
    goal = Goal.find_by(name: goal_name)
    unless goal
      return render json: { message: 'Goal not found' }, status: 404
    end
    
    # Find active event participation
    participant = user.event_participants.joins(:event).where(events: { status: 'active' }).first
    if participant
      # Event-specific progress tracking
      unless participant.completed_goals.include?(goal_name)
        participant.completed_goals << goal_name
        participant.points += 20  # Award points for completing a goal (fixed from 30 to 20)
        participant.save!
      end
      
      render json: { message: 'Goal completed', points: participant.points }
    else
      # Fallback to global tracking when no active event
      unless user.completed_goals.include?(goal)
        user.completed_goals << goal
        user.points += 20  # Award points for completing a goal (fixed from 30 to 20)
        user.current_goal = nil if user.current_goal == goal_name
        user.save!
      end
      
      render json: { message: 'Goal completed', points: user.points }
    end
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
    if participant
      return render json: { message: 'Already joined this event' }, status: 400
    end
    
    EventParticipant.create!(
      event: event,
      user: user,
      points: 0,
      visited_bars: [],
      completed_goals: []
    )
    
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