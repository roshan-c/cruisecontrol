# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_07_15_004319) do
  create_table "bars", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "event_bars", force: :cascade do |t|
    t.integer "event_id", null: false
    t.integer "bar_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["bar_id"], name: "index_event_bars_on_bar_id"
    t.index ["event_id"], name: "index_event_bars_on_event_id"
  end

  create_table "event_goals", force: :cascade do |t|
    t.integer "event_id", null: false
    t.integer "goal_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["event_id"], name: "index_event_goals_on_event_id"
    t.index ["goal_id"], name: "index_event_goals_on_goal_id"
  end

  create_table "event_participants", force: :cascade do |t|
    t.integer "event_id", null: false
    t.integer "user_id", null: false
    t.integer "points"
    t.text "visited_bars"
    t.text "completed_goals"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["event_id"], name: "index_event_participants_on_event_id"
    t.index ["user_id"], name: "index_event_participants_on_user_id"
  end

  create_table "events", force: :cascade do |t|
    t.string "name"
    t.datetime "start_time"
    t.integer "duration"
    t.string "status"
    t.datetime "end_time"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "goals", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "user_bars", force: :cascade do |t|
    t.integer "user_id", null: false
    t.integer "bar_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["bar_id"], name: "index_user_bars_on_bar_id"
    t.index ["user_id"], name: "index_user_bars_on_user_id"
  end

  create_table "user_goals", force: :cascade do |t|
    t.integer "user_id", null: false
    t.integer "goal_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["goal_id"], name: "index_user_goals_on_goal_id"
    t.index ["user_id"], name: "index_user_goals_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "username"
    t.string "password"
    t.boolean "is_admin"
    t.integer "points"
    t.string "current_goal"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_foreign_key "event_bars", "bars"
  add_foreign_key "event_bars", "events"
  add_foreign_key "event_goals", "events"
  add_foreign_key "event_goals", "goals"
  add_foreign_key "event_participants", "events"
  add_foreign_key "event_participants", "users"
  add_foreign_key "user_bars", "bars"
  add_foreign_key "user_bars", "users"
  add_foreign_key "user_goals", "goals"
  add_foreign_key "user_goals", "users"
end
