//AWS
#include "sha256.h"
#include "Utils.h"
#include "AWSClient2.h"

//WEBSockets
#include <Hash.h>
#include <WebSocketsClient.h>

//MQTT PAHO
#include <SPI.h>
#include <IPStack.h>
#include <Countdown.h>
#include <MQTTClient.h>

//AWS MQTT Websocket
#include "Client.h"
#include "AWSWebSocketClient.h"
#include "CircularByteBuffer.h"

namespace MQTTCommand
{
//AWS IOT config, change these:
char aws_endpoint[] = "endpoint.iot.us-east-1.amazonaws.com"; // Login tài khoản aws và lấy endpoint ở đây https://console.aws.amazon.com/iot/home?region=us-east-1#/settings 
char aws_key[] = "access key ID";          // Login tài khoản aws và lấy key ở đây https://console.aws.amazon.com/iam/home#/security_credential              
char aws_secret[] = "secret access key";   // Login tài khoản aws và lấy key ở đây https://console.aws.amazon.com/iam/home#/security_credential
char aws_region[] = "us-east-1"; 
int port = 443;

//MQTT config
const int maxMQTTpackageSize = 512;
const int maxMQTTMessageHandlers = 1;

AWSWebSocketClient awsWSclient(1000);

IPStack ipstack(awsWSclient);
MQTT::Client<IPStack, Countdown, maxMQTTpackageSize, maxMQTTMessageHandlers> *client = NULL;

//init function
void init()
{
  //fill AWS parameters
  awsWSclient.setAWSRegion(aws_region);
  awsWSclient.setAWSDomain(aws_endpoint);
  awsWSclient.setAWSKeyID(aws_key);
  awsWSclient.setAWSSecretKey(aws_secret);
  awsWSclient.setUseSSL(true);
}

//generate random mqtt clientID
char *generateClientID()
{
  char *cID = new char[23]();
  for (int i = 0; i < 22; i += 1)
    cID[i] = (char)random(1, 256);
  return cID;
}

//connects to websocket layer and mqtt layer
bool connect()
{
  if (client == NULL)
  {
    client = new MQTT::Client<IPStack, Countdown, maxMQTTpackageSize, maxMQTTMessageHandlers>(ipstack);
  }
  else
  {
    if (client->isConnected())
    {
      client->disconnect();
    }
    delete client;
    client = new MQTT::Client<IPStack, Countdown, maxMQTTpackageSize, maxMQTTMessageHandlers>(ipstack);
  }

  //delay is not necessary... it just help us to get a "trustful" heap space value
  delay(1000);

  int rc = ipstack.connect(aws_endpoint, port);
  if (rc != 1)
  {
    Serial.println("error connection to the websocket server");
    return false;
  }
  else
  {
    Serial.println("websocket layer connected");
  }

  Serial.println("MQTT connecting");
  MQTTPacket_connectData data = MQTTPacket_connectData_initializer;
  data.MQTTVersion = 3;
  char *clientID = generateClientID();
  data.clientID.cstring = clientID;
  rc = client->connect(data);
  delete[] clientID;
  if (rc != 0)
  {
    Serial.println("error connection to MQTT server");
    Serial.println(rc);
    return false;
  }
  Serial.println("MQTT connected");
  return true;
}

//subscribe to a mqtt topic
//typedef void (*callbackFunction)(MQTT::MessageData &md);

void subscribe(char *topic, MQTT::QoS qos, void (*callbackFunction)(MQTT::MessageData &md))
{
  Serial.println("subscribe");
  //subscript to a topic
  int rc = client->subscribe(topic, qos, callbackFunction);
  if (rc != 0)
  {
    Serial.println("rc from MQTT subscribe is ");
    Serial.println(rc);
    return;
  }
  Serial.println("MQTT subscribed");
}

//send a message to a mqtt topic
void sendmessage(char *topic, MQTT::QoS qos, char json_data[])
{
  //send a message
  MQTT::Message message;
  message.qos = qos;
  message.retained = false;
  message.dup = false;
  message.payload = (void *)json_data;
  message.payloadlen = strlen(json_data) + 1;
  int rc = client->publish(topic, message);
}
}
