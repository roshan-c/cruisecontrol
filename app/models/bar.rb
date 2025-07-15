class Bar < ApplicationRecord
  has_many :user_bars, dependent: :destroy
  has_many :users, through: :user_bars
  has_many :event_bars, dependent: :destroy
  has_many :events, through: :event_bars
  
  validates :name, presence: true, uniqueness: true
end
