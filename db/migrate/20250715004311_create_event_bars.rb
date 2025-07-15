class CreateEventBars < ActiveRecord::Migration[8.0]
  def change
    create_table :event_bars do |t|
      t.references :event, null: false, foreign_key: true
      t.references :bar, null: false, foreign_key: true

      t.timestamps
    end
  end
end
