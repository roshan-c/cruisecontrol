class Event < ApplicationRecord
  has_many :event_participants, dependent: :destroy
  has_many :users, through: :event_participants
  has_many :event_bars, dependent: :destroy
  has_many :available_bars, through: :event_bars, source: :bar
  has_many :event_goals, dependent: :destroy
  has_many :available_goals, through: :event_goals, source: :goal
  
  validates :name, presence: true
  validates :start_time, presence: true
  validates :duration, presence: true, numericality: { greater_than: 0 }
  
  def active?
    status == 'active'
  end
  
  def completed?
    status == 'completed'
  end
end
