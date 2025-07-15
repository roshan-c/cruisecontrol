class EventParticipant < ApplicationRecord
  belongs_to :event
  belongs_to :user
  
  # Serialize arrays for visited_bars and completed_goals
  serialize :visited_bars, JSON
  serialize :completed_goals, JSON
  
  before_save :ensure_arrays
  
  private
  
  def ensure_arrays
    self.visited_bars ||= []
    self.completed_goals ||= []
  end
end
