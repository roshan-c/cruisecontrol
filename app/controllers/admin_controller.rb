class AdminController < ApplicationController
  before_action :require_login
  before_action :require_admin
  
  # GET /admin/
  def index
    render json: { message: 'Admin panel access granted' }
  end
  
  # GET /admin/users
  def users
    users = User.all.map do |user|
      {
        id: user.id,
        username: user.username,
        points: user.points,
        isAdmin: user.is_admin,
        visitedBars: user.visited_bars.pluck(:name),
        completedGoals: user.completed_goals.pluck(:name)
      }
    end
    
    render json: users
  end
  
  # GET /admin/events
  def events
    events = Event.includes(:event_participants, :available_bars, :available_goals).map do |event|
      {
        id: event.id,
        name: event.name,
        startTime: event.start_time,
        duration: event.duration,
        status: event.status,
        endTime: event.end_time,
        participants: event.event_participants.includes(:user).map do |participant|
          {
            username: participant.user.username,
            points: participant.points,
            visitedBars: participant.visited_bars || [],
            completedGoals: participant.completed_goals || []
          }
        end,
        settings: {
          availableBars: event.available_bars.pluck(:name),
          availableGoals: event.available_goals.pluck(:name)
        }
      }
    end
    
    render json: events
  end
  
  # POST /admin/create-event
  def create_event
    name = params[:name]
    duration = params[:duration]
    
    if name.blank? || duration.blank?
      return render json: { message: 'Missing required event details' }, status: 400
    end
    
    event = Event.create!(
      name: name,
      start_time: Time.current,
      duration: duration.to_i * 60 * 1000,  # Convert minutes to milliseconds
      status: 'active'
    )
    
    # Add all bars and goals to the event
    event.available_bars = Bar.all
    event.available_goals = Goal.all
    
    render json: { 
      message: 'Event created successfully', 
      event: {
        id: event.id,
        name: event.name,
        startTime: event.start_time,
        duration: event.duration,
        status: event.status
      }
    }
  end
  
  # POST /admin/end-event
  def end_event
    event_id = params[:eventId]
    
    event = Event.find_by(id: event_id)
    unless event
      return render json: { message: 'Event not found' }, status: 404
    end
    
    event.update!(status: 'completed', end_time: Time.current)
    
    render json: { message: 'Event ended successfully' }
  end
  
  # POST /admin/add-bar
  def add_bar
    bar_name = params[:name]
    
    if bar_name.blank?
      return render json: { message: 'Bar name is required' }, status: 400
    end
    
    if Bar.exists?(name: bar_name)
      return render json: { message: 'Bar already exists' }, status: 400
    end
    
    bar = Bar.create!(name: bar_name)
    
    render json: { message: 'Bar added successfully', bar: { id: bar.id, name: bar.name } }
  end
  
  # DELETE /admin/delete-bar/:id
  def delete_bar
    bar_id = params[:id]
    
    bar = Bar.find_by(id: bar_id)
    unless bar
      return render json: { message: 'Bar not found' }, status: 404
    end
    
    bar.destroy
    
    render json: { message: 'Bar deleted successfully' }
  end
  
  # POST /admin/update-user-points
  def update_user_points
    user_id = params[:userId]
    points = params[:points]
    
    user = User.find_by(id: user_id)
    unless user
      return render json: { message: 'User not found' }, status: 404
    end
    
    user.update!(points: points.to_i)
    
    render json: { message: 'User points updated successfully' }
  end
  
  # DELETE /admin/delete-user/:id
  def delete_user
    user_id = params[:id]
    
    user = User.find_by(id: user_id)
    unless user
      return render json: { message: 'User not found' }, status: 404
    end
    
    # Don't allow deleting yourself
    if user == current_user
      return render json: { message: 'Cannot delete your own account' }, status: 400
    end
    
    user.destroy
    
    render json: { message: 'User deleted successfully' }
  end
end
