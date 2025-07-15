class Goal < ApplicationRecord
  has_many :user_goals, dependent: :destroy
  has_many :users, through: :user_goals
  has_many :event_goals, dependent: :destroy
  has_many :events, through: :event_goals
  
  validates :name, presence: true, uniqueness: true
end
