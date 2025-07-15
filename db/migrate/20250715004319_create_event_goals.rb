class CreateEventGoals < ActiveRecord::Migration[8.0]
  def change
    create_table :event_goals do |t|
      t.references :event, null: false, foreign_key: true
      t.references :goal, null: false, foreign_key: true

      t.timestamps
    end
  end
end
