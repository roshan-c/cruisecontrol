class CreateUsers < ActiveRecord::Migration[8.0]
  def change
    create_table :users do |t|
      t.string :username
      t.string :password
      t.boolean :is_admin
      t.integer :points
      t.string :current_goal

      t.timestamps
    end
  end
end
