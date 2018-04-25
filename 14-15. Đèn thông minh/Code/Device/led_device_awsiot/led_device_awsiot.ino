#include <Arduino.h>
#include <Stream.h>

#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>

//JSON
#include <ArduinoJson.h>

//MQTT command
#include <MQTTClient.h>
#include "mqtt-command.h"


ESP8266WiFiMulti WiFiMulti;
DynamicJsonBuffer jsonBuffer;
//Wifi config
char wifi_ssid[] = "ssid";
char wifi_password[] = "password";
int disconnected = 0;

//AWS topic
char *subscribe_topic = "aws/light/control/";

//callback to handle mqtt messages
void messageArrived(MQTT::MessageData &md)
{
  MQTT::Message &message = md.message;
  char *msg = new char[message.payloadlen + 1]();
  memcpy(msg, message.payload, message.payloadlen);
  Serial.println(msg);
  StaticJsonBuffer<3000> jsonBuffer;
  JsonObject &json_parsed = jsonBuffer.parseObject(msg);

  if (!json_parsed.success())
  {
    Serial.println("parsing failed");
    delay(500);
    return;
  }
  String type = json_parsed["type"];
  String device = json_parsed["device"];
  String power = json_parsed["power"];
  if (type == "control")
  {
    if (device == "ac")
    {
      if (power == "on")
      {
        // digitalWrite(LED, HIGH);

        Serial.println("Turn on the AC");
      }
      else if (power == "off")
      {
        // digitalWrite(LED, LOW);
        Serial.println("Turn off the AC");
      }
    }
  }
  delete msg;
}

void reconnectWifi()
{
  WiFi.begin(wifi_ssid, wifi_password);
}

void onDisconnected(const WiFiEventStationModeDisconnected &event)
{
  Serial.println("Disconnected");
      disconnected = 1;
  reconnectWifi();
}

void setup()
{
  Serial.begin(115200);
  delay(1000);

  //Fill with ssid and wifi password
  WiFiMulti.addAP(wifi_ssid, wifi_password);
  Serial.println("connecting to wifi");
  while (WiFiMulti.run() != WL_CONNECTED)
  {
    delay(100);
    Serial.print(".");
  }
  Serial.println("\nconnected");
  WiFi.onStationModeDisconnected(&onDisconnected);

  MQTTCommand::init();
  if (MQTTCommand::connect())
  {
    MQTTCommand::subscribe(subscribe_topic, MQTT::QOS0, &messageArrived);
  }
}


void loop()
{
  if (disconnected == 1 && WiFi.status() == WL_CONNECTED)
  {
    Serial.print(String("[WIFI] IP: "));
    Serial.println(WiFi.localIP());
    disconnected = 0;
  }
  if (!disconnected)
  {
    //keep the mqtt up and running
    if (MQTTCommand::awsWSclient.connected())
    {
      MQTTCommand::client->yield();
    }
    else
    {
      //handle reconnection
      if (MQTTCommand::connect())
      {
        MQTTCommand::subscribe(subscribe_topic, MQTT::QOS0, &messageArrived);
      }
    }
  }
}


