class CreateUserBars < ActiveRecord::Migration[8.0]
  def change
    create_table :user_bars do |t|
      t.references :user, null: false, foreign_key: true
      t.references :bar, null: false, foreign_key: true

      t.timestamps
    end
  end
end
