# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

# Create bars from the original data
bars_data = [
  "Postern Gate", "Stone Roses", "Yates", "Lowthers", "Old Bank",
  "Tank and Paddle", "Slug and Lettuce", "Stonebow", "Golden Fleece",
  "Brew York", "Keystones", "fart bar"
]

bars_data.each do |bar_name|
  Bar.find_or_create_by(name: bar_name)
end

# Create goals from the original data
goals_data = [
  "Take a shot out of Roshan's mystery flask",
  "Down your drink",
  "Order your drink in another language",
  "Finish your drink within 10 seconds",
  "Order a drink that is the opposite colour of your shirt",
  "Order a drink that is the same colour as your shirt",
  "Take a selfie with the bartender",
  "Ask the bar staff if they know who John Pork is",
  "Ask the bar staff for a random fact",
  "Ask someone on a date and exchange contact info"
]

goals_data.each do |goal_name|
  Goal.find_or_create_by(name: goal_name)
end

# Create the original admin user
User.find_or_create_by(username: "roshan") do |user|
  user.password = "Pjproby123!"
  user.is_admin = true
  user.points = 0
  user.current_goal = "Order your drink in another language"
end

puts "Seeded #{Bar.count} bars"
puts "Seeded #{Goal.count} goals"
puts "Seeded #{User.count} users"
