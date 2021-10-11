# frozen_string_literal: true

require 'eventmachine'
require 'sinatra'
require 'pp'
require 'json'
require 'securerandom'

#ENV['JWT_SECRET'] = "THISISASECRET"
SCHEDULE_TIME = 300
connections = []
registered_users = Hash.new

EventMachine.schedule do
  EventMachine.add_periodic_timer(SCHEDULE_TIME) do
    # Change this for any timed events you need to schedule.
    puts "This message will be output to the server console every #{SCHEDULE_TIME} seconds"
  end
end

configure do
  enable :cross_origin
end

before do
  response.headers["Access-Control-Allow-Origin"] = "*"
end

options "*" do
  response.headers["Allow"] = "HEAD,GET,PUT,POST,DELETE,OPTIONS" 
  response.headers["Access-Control-Allow-Headers"] = "X-Requested-With, X-HTTP-Method-Override, Access-Control-Allow-Origin, Content-Type, Cache-Control, Accept"
  200
end


get '/stream/:token', provides: 'text/event-stream' do
  headers 'Access-Control-Allow-Origin' => '*'
  stream(:keep_open) do |connection|
    connections << connection

    connection << "data: Welcome!\n\n"

    connection.callback do
      puts 'callback'
      connections.delete(connection)
    end
  end
end

post '/login' do
  req = JSON.parse(request.body.read)
  uname = req['username']
  password = req['password']

  numfields = req.keys.count

  if uname != nil and password != nil and numfields == 2 and uname.strip.length >= 1 and password.strip.length >= 1
    if registered_users[uname] == nil  
      msgToken = SecureRandom.alphanumeric(50)
      streamToken = SecureRandom.alphanumeric(50)

      userDetails = Array[password, msgToken, streamToken]
      
      registered_users[uname] = userDetails
      body ({"message_token": msgToken, "stream_token": streamToken}).to_json
      status 201

    elsif registered_users[uname] != nil and registered_users[uname][0] != password
      status 403
    end
  elsif
    status 422
  end 
end

post '/message' do
  

  connections.each do |connection|
    connection << "data: Goodbye!\n\n"
    connection.close  # This call will trigger connection.callback
  end

  puts 'Headers'
  PP.pp(request.env.filter { |x| x.start_with?('HTTP_') })

  puts 'request.params:'
  PP.pp request.params

  [403, "POST /message\n"]
end
