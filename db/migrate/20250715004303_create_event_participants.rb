class CreateEventParticipants < ActiveRecord::Migration[8.0]
  def change
    create_table :event_participants do |t|
      t.references :event, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.integer :points
      t.text :visited_bars
      t.text :completed_goals

      t.timestamps
    end
  end
end
