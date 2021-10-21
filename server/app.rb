# frozen_string_literal: true

require 'eventmachine'
require 'sinatra'
require 'pp'
require 'json'
require 'securerandom'
require 'jwt'

ENV['JWT_SECRET'] = "THISISASECRET"
SCHEDULE_TIME = 600
connections = []
registered_users = Hash.new
online_users = []
message100_list = []
user_connection= Hash.new

random = SecureRandom.alphanumeric(10)
eventdata = {'status': 'Server is up', 'created':Time.now.to_f}.to_json
while message100_list.length >= 100
  message100_list.shift
end
data = ["ServerStatus", eventdata, random]
message100_list << data;


EventMachine.schedule do
  EventMachine.add_periodic_timer(SCHEDULE_TIME) do
    random = SecureRandom.alphanumeric(10)
    eventdata = {'status': 'Server is up', 'created':Time.now.to_f}.to_json
    while message100_list.length >= 100
      message100_list.shift
    end
    data = ["ServerStatus", eventdata, random]
    message100_list << data;
    connections.each do |connection|      
      connection << "event: ServerStatus\n"
      connection << "data: #{eventdata}\n"
      connection << "id: #{random}\n\n"
    end
    # Change this for any timed events you need to schedule.
    #puts "This message will be output to the server console every #{SCHEDULE_TIME} seconds"
  end
end

configure do
  enable :cross_origin
end

before do
  response.headers["Access-Control-Allow-Origin"] = "*"
end

options "*" do
  response.headers["Allow"] = "HEAD,GET,POST,OPTIONS" 
  response.headers["Access-Control-Allow-Headers"] = "Access-Control-Allow-Origin, Content-Type, Cache-Control, Accept, Authorization"
  200
end


get '/stream/:token', provides: 'text/event-stream' do
  headers 'Access-Control-Allow-Origin' => '*'

  strmToken = params['token'];
  currentTime = Time.now;
  
  begin
    decodeToken = JWT.decode strmToken, ENV['JWT_SECRET'], 'HS256'
  rescue JWT::DecodeError, JWT::VerificationError
    puts "Exception caught"
    status 403
    return
  end
  
  if decodeToken != nil and decodeToken[0] != nil and decodeToken[0]['data'] != nil and decodeToken[0]['data']['user'] != nil
    currUser = decodeToken[0]['data']['user']
  else
    status 403
    return
  end
  if registered_users[currUser] == nil 
    status 403
    return
  elsif registered_users[currUser][2] != strmToken
    puts "invalid stream token " + strmToken
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

  #registered_users[currUser][2] = "";
  online_users << currUser; 
  
  stream(:keep_open) do |connection|

    user_connection[currUser] = connection;

    connections << connection

    lastEventId = request.env['HTTP_LAST_EVENT_ID'] ? request.env['HTTP_LAST_EVENT_ID'] : ""
    pos = -1
    if lastEventId.strip.length > 0
      len = message100_list.length() - 1
      for a in 0..len do
        if message100_list[a][2] == lastEventId
          pos = a + 1
          break;
        end
      end
      if pos >= 0 and pos <= len
        for a in pos..len do
          connection << "event: #{message100_list[a][0]}\n"
          connection << "data: #{message100_list[a][1]}\n"
          connection << "id: #{message100_list[a][2]}\n\n"
        end
      elsif pos = -1
        for arr in message100_list do
          #puts arr[2];
          connection << "event: #{arr[0]}\n"
          connection << "data: #{arr[1]}\n"
          connection << "id: #{arr[2]}\n\n"
        end

        eventdata = {'users': online_users, 'created':Time.now.to_f}.to_json

        connection << "event: Users\n"
        connection << "data: #{eventdata}\n"
        connection << "id: #{SecureRandom.alphanumeric(10)}\n\n"  
      end
    else

      for arr in message100_list do
        if arr[0] != 'Join' and arr[0] != 'Part'
          connection << "event: #{arr[0]}\n"
          connection << "data: #{arr[1]}\n"
          connection << "id: #{arr[2]}\n\n"
        end
      end

      eventdata = {'users': online_users, 'created':Time.now.to_f}.to_json

      connection << "event: Users\n"
      connection << "data: #{eventdata}\n"
      connection << "id: #{SecureRandom.alphanumeric(10)}\n\n"
    end

    random = SecureRandom.alphanumeric(10)
    eventdata = {'user': currUser, 'created':Time.now.to_f}.to_json
    while message100_list.length >= 100
      message100_list.shift
    end
    data = ["Join", eventdata, random]
    message100_list << data;

    connections.each do |connection|
      connection << "event: Join\n"
      connection << "data: #{eventdata}\n"
      connection << "id: #{random}\n\n"
    end


    connection.callback do  
      online_users.delete(currUser)
      user_connection.delete(currUser)
      connections.delete(connection)

      random = SecureRandom.alphanumeric(10)
      eventdata = {'user': currUser, 'created':Time.now.to_f}.to_json
      while message100_list.length >= 100
        message100_list.shift
      end
      data = ["Part", eventdata, random]
      message100_list << data;

      connections.each do |connection| 
        connection << "event: Part\n"
        connection << "data: #{eventdata}\n"
        connection << "id: #{random}\n\n"
      end
      
    end
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

  message = params[:message]

  num = params.size()
  
  authtype = request.env['HTTP_AUTHORIZATION']
  if authtype != nil
    autharray = authtype.split()
  else
    status 403
    return
  end
  if autharray.length() != 2 
    status 422
    return
  end
  if autharray[0] == 'Bearer' and autharray[1] != nil and autharray[1].length > 0
    begin
      decodeToken = JWT.decode autharray[1], ENV['JWT_SECRET'], 'HS256'
      currUser = decodeToken[0]['data']['user']
      if registered_users[currUser] == nil 
        status 403
        return
      elsif registered_users[currUser][1] != autharray[1]
        status 403
        return
      end

      if message == nil or message.strip.length == 0 or num != 1
        status 422
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

      random = SecureRandom.alphanumeric(10)
      if message == '/quit'
        connection = user_connection[currUser]
        eventdata = {'created':Time.now.to_f}.to_json
        connection << "event: Disconnect\n"
        connection << "data: #{eventdata}\n"
        connection << "id: #{SecureRandom.alphanumeric(10)}\n\n" 
        connection.close;
      elsif message == '/reconnect'
        connection = user_connection[currUser]
        connection.close;
      elsif message.start_with?('/kick')
        msgarr = message.split()
        presentSir = false
        online_users.each do |user|
          if user == msgarr[1]
            presentSir = true
            break
          end
        end
        if presentSir
          eventdata = {'user': currUser, 'created':Time.now.to_f, 'message': currUser + " kicked " + msgarr[1]}.to_json
          while message100_list.length >= 100
            message100_list.shift
          end
          data = ["Message", eventdata, random]
          message100_list << data;
    
          connections.each do |connection|

            connection << "event: Message\n"
            connection << "data: #{eventdata}\n"
            connection << "id: #{random}\n\n"
          end

          connection = user_connection[msgarr[1]]
          connection.close;
          
        else
          msgPayload = {
            data: {'user':currUser, 'message':random}
          }
          msgToken =  JWT.encode msgPayload, ENV['JWT_SECRET'], 'HS256'
      
          registered_users[currUser][1] = msgToken;

          headers 'Token' => msgToken
          headers 'Access-Control-Expose-Headers' => 'Token'  
          status 409
          return
        end
      else
        eventdata = {'user': currUser, 'created':Time.now.to_f, 'message': message}.to_json
        while message100_list.length >= 100
          message100_list.shift
        end
        data = ["Message", eventdata, random]
        message100_list << data;
  
        connections.each do |connection|

          connection << "event: Message\n"
          connection << "data: #{eventdata}\n"
          connection << "id: #{random}\n\n"
        end
      end

      msgPayload = {
        data: {'user':currUser, 'message':random}
      }
      
      msgToken =  JWT.encode msgPayload, ENV['JWT_SECRET'], 'HS256'
      
      registered_users[currUser][1] = msgToken;

      headers 'Token' => msgToken
      headers 'Access-Control-Expose-Headers' => 'Token'
      status 201

    rescue JWT::DecodeError, JWT::VerificationError
      response(body: nil, status: 403)
    end
  else
    status 403
    return
  end
end
