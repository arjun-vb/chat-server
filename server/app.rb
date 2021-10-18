# frozen_string_literal: true

require 'eventmachine'
require 'sinatra'
require 'pp'
require 'json'
require 'securerandom'
require 'jwt'

ENV['JWT_SECRET'] = "THISISASECRET"
SCHEDULE_TIME = 300
connections = []
registered_users = Hash.new
online_users = []
message100_list = []
user_connection= Hash.new


#EventMachine.schedule do
 # EventMachine.add_periodic_timer(SCHEDULE_TIME) do
    # Change this for any timed events you need to schedule.
    #puts "This message will be output to the server console every #{SCHEDULE_TIME} seconds"
  #end
#end

configure do
  enable :cross_origin
end

before do
  response.headers["Access-Control-Allow-Origin"] = "*"
end

options "*" do
  response.headers["Allow"] = "HEAD,GET,PUT,POST,DELETE,OPTIONS" 
  response.headers["Access-Control-Allow-Headers"] = "X-Requested-With, X-HTTP-Method-Override, Access-Control-Allow-Origin, Content-Type, Cache-Control, Accept, Authorization"
  200
end


get '/stream/:token', provides: 'text/event-stream' do
  headers 'Access-Control-Allow-Origin' => '*'

  strmToken = params['token'];
  currentTime = Time.now;
  
  begin
    decodeToken = JWT.decode strmToken, ENV['JWT_SECRET'], 'HS256'
    currUser = decodeToken[0]['data']['user']
    if registered_users[currUser] == nil 
      status 403
      return
    elsif registered_users[currUser][2] != strmToken
      status 403
      return
    end
    online_users.each do |user|
      if user == currUser
        streamopen = true;
        status 409
        return  
      end
    end

    online_users << currUser; 

    connections.each do |connection|
      eventdata = {'user': currUser, 'created':Time.now.to_f}.to_json

      connection << "event: Join\n"
      connection << "data: #{eventdata}\n"
      connection << "id: \n\n"
    end
    
    stream(:keep_open) do |connection|

      user_connection[currUser] = connection;

      connections << connection

      #created':Time.now.strftime("%m/%d/%Y %I:%M %p")
      #time = Time.now;
      
      eventdata = {'status': 'Server is up', 'created':Time.now.to_f}.to_json

      connection << "event: ServerStatus\n"
      connection << "data: #{eventdata}\n"
      connection << "id: random1\n\n"

      eventdata = {'users': online_users, 'created':Time.now.to_f}.to_json

      connection << "event: Users\n"
      connection << "data: #{eventdata}\n"
      connection << "id: random2\n\n"

      eventdata = {'user': currUser, 'message': online_users[0],'created':Time.now.to_f}.to_json

      connection << "event: Message\n"
      connection << "data: #{eventdata}\n"
      connection << "id: random3\n\n"


      connection.callback do
        online_users.delete(currUser)
        user_connection.delete(currUser)
        puts 'callback'
        connections.delete(connection)

        connections.each do |connection|
          eventdata = {'user': currUser, 'created':Time.now.to_f}.to_json

          connection << "event: Part\n"
          connection << "data: #{eventdata}\n"
          connection << "id: random1\n\n"
        end
      end
    end
  rescue JWT::DecodeError, JWT::VerificationError
    response(body: nil, status: 403)
  end
  status 200
end

post '/login' do
  #puts params
  uname = params[:username]
  password = params[:password]

  numfields = params.size()

  online_users.each do |user|
    if user == uname
      streamopen = true;
      status 409
      return  
    end
  end

  if uname != nil and password != nil and numfields == 2 and uname.strip.length >= 1 and password.strip.length >= 1
    if registered_users[uname] == nil 
      msgPayload = {
        data: {'user':uname, 'message':SecureRandom.alphanumeric(30)}
      }
      streamPayload = {
        data: {'user':uname, 'message':SecureRandom.alphanumeric(30)}
      }
      msgToken =  JWT.encode msgPayload, ENV['JWT_SECRET'], 'HS256'
      streamToken = JWT.encode streamPayload, ENV['JWT_SECRET'], 'HS256'

      userDetails = Array[password, msgToken, streamToken]
      
      registered_users[uname] = userDetails;

      #puts registered_users[uname];
      #online_users << uname; 
      body ({"message_token": msgToken, "stream_token": streamToken}).to_json
      status 201
    elsif registered_users[uname] != nil and registered_users[uname][0] == password
      msgPayload = {
        data: {'user':uname, 'message':SecureRandom.alphanumeric(30)}
      }
      streamPayload = {
        data: {'user':uname, 'message':SecureRandom.alphanumeric(30)}
      }
      msgToken =  JWT.encode msgPayload, ENV['JWT_SECRET'], 'HS256'
      streamToken = JWT.encode streamPayload, ENV['JWT_SECRET'], 'HS256'

      userDetails = registered_users[uname];
      userDetails[1] = msgToken;
      userDetails[2] = streamToken;

      #puts registered_users[uname];
      #online_users << uname; 
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

  #req = JSON.parse(request.body.read)
  #message = req['message']
  #num = req.keys.count

  message = params[:message]

  num = params.size()
  
  authtype = request.env['HTTP_AUTHORIZATION']
  autharray = authtype.split()
  if autharray.length() == 2 and autharray[0] == 'Bearer' and autharray[1] != nil and autharray[1].length > 0
    begin
      decodeToken = JWT.decode autharray[1], ENV['JWT_SECRET'], 'HS256'
      currUser = decodeToken[0]['data']['user']
      if registered_users[currUser] == nil 
        puts "there"
        status 403
        return
      elsif registered_users[currUser][1] != autharray[1]
        puts "here"
        status 403
        return
      end
      streamopen = false;

      online_users.each do |user|
        if user == currUser
          streamopen = true;
        end
      end

      if streamopen == false
        status 409
        return
      end

      if message == nil or message.strip.length == 0 or num != 1
        status 422
        return
      end

      if message == '/quit'
        connection = user_connection[currUser]
        connection.close;
      elsif message == '/reconnect'

      elsif message.start_with?('/kick')
        msgarr = message.split()
        connection = user_connection[msgarr[1]]
        connection.close;
      else   
        connections.each do |connection|
          eventdata = {'user': currUser, 'created':Time.now.to_f, 'message': message}.to_json

          connection << "event: Message\n"
          connection << "data: #{eventdata}\n"
          connection << "id: random1\n\n"
        end
      end

      msgPayload = {
        data: {'user':currUser, 'message':SecureRandom.alphanumeric(30)}
      }
      
      msgToken =  JWT.encode msgPayload, ENV['JWT_SECRET'], 'HS256'
      
      registered_users[currUser][1] = msgToken;

      puts registered_users[currUser]
      headers 'Token' => msgToken
      status 201

    rescue JWT::DecodeError, JWT::VerificationError
      response(body: nil, status: 403)
    end
  end
end
