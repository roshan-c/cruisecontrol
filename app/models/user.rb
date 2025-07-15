class User < ApplicationRecord
  has_many :user_bars, dependent: :destroy
  has_many :visited_bars, through: :user_bars, source: :bar
  has_many :user_goals, dependent: :destroy
  has_many :completed_goals, through: :user_goals, source: :goal
  has_many :event_participants, dependent: :destroy
  has_many :events, through: :event_participants
  
  validates :username, presence: true, uniqueness: true
  validates :password, presence: true
  
  def is_admin?
    is_admin
  end
end
