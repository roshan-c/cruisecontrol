require "test_helper"

class AdminControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get admin_index_url
    assert_response :success
  end

  test "should get users" do
    get admin_users_url
    assert_response :success
  end

  test "should get events" do
    get admin_events_url
    assert_response :success
  end

  test "should get create_event" do
    get admin_create_event_url
    assert_response :success
  end
end
