Rails.application.routes.draw do
  # Authentication routes (matching Node.js structure)
  post '/login', to: 'auth#login'
  post '/signup', to: 'auth#signup'
  post '/logout', to: 'auth#logout'
  
  # User routes
  scope '/home' do
    get '/', to: 'users#index'
    get '/user-data', to: 'users#show'
    post '/visit-bar', to: 'users#visit_bar'
    post '/complete-goal', to: 'users#complete_goal'
    post '/join-event', to: 'users#join_event'
    post '/leave-event', to: 'users#leave_event'
  end
  
  # Admin routes
  scope '/admin' do
    get '/', to: 'admin#index'
    get '/users', to: 'admin#users'
    get '/events', to: 'admin#events'
    post '/create-event', to: 'admin#create_event'
    post '/end-event', to: 'admin#end_event'
    post '/add-bar', to: 'admin#add_bar'
    delete '/delete-bar/:id', to: 'admin#delete_bar'
    post '/update-user-points', to: 'admin#update_user_points'
    delete '/delete-user/:id', to: 'admin#delete_user'
    
    # Event-specific routes
    post '/events/:id/join', to: 'admin#join_event'
    post '/events/:id/progress', to: 'admin#update_progress'
    get '/events/:id/results', to: 'admin#event_results'
    post '/goals', to: 'admin#add_goal'
  end
  
  # Legacy route aliases to maintain API compatibility
  scope '/admin' do
    post '/updatePoints', to: 'admin#update_user_points'
    post '/bars', to: 'admin#add_bar'
  end
  
  # Health check
  get "up" => "rails/health#show", as: :rails_health_check
  
  # Static files - serve index.html at root
  root "application#index"
end
