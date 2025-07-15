class AuthController < ApplicationController
  # POST /login
  def login
    username = params[:username]
    password = params[:password]
    
    Rails.logger.info "Received login attempt: #{username}"
    
    if username.blank? || password.blank?
      return render json: { message: 'Username and password are required' }, status: 400
    end
    
    user = User.find_by(username: username)
    
    if user.nil? || user.password != password
      return render json: { message: 'Invalid credentials' }, status: 400
    end
    
    session[:username] = username
    session[:is_admin] = user.is_admin
    
    render json: { message: 'Login successful', isAdmin: user.is_admin }
  end
  
  # POST /signup
  def signup
    username = params[:username]
    password = params[:password]
    is_admin = params[:isAdmin]
    
    if username.blank? || password.blank?
      return render json: { message: 'Username and password are required' }, status: 400
    end
    
    if User.exists?(username: username)
      return render json: { message: 'Username already exists' }, status: 400
    end
    
    user = User.create!(
      username: username,
      password: password,
      is_admin: is_admin == 'true' || is_admin == true,
      points: 0,
      current_goal: nil
    )
    
    # Automatically log in the user after signup
    session[:username] = username
    session[:is_admin] = user.is_admin
    
    render json: { message: 'Signup successful', isAdmin: user.is_admin }
  end
  
  # POST /logout  
  def logout
    session.destroy
    render json: { message: 'Logout successful' }
  end
end
