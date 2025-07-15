class EventGoal < ApplicationRecord
  belongs_to :event
  belongs_to :goal
end
