class ApplicationController < ActionController::API
  include ActionController::Cookies
  
  def index
    # Serve the index.html file for the root route
    send_file Rails.root.join('views', 'index.html'), 
              type: 'text/html', 
              disposition: 'inline'
  end
  
  protected
  
  def current_user
    @current_user ||= User.find_by(username: session[:username]) if session[:username]
  end
  
  def require_login
    unless current_user
      render json: { message: 'Unauthorized' }, status: 401
    end
  end
  
  def require_admin
    unless current_user&.is_admin?
      render json: { message: 'Admin access required' }, status: 403
    end
  end
end
