/*
 * @Organization: Maker Hanoi
 * 
 * This program make ESP8266 used as an MQTT Client
 * connect to mqtt broker and send data to specific topic
 * and display data on the server by using FreeBoard
 */

#include <ESP8266WiFi.h>
#include <PubSubClient.h>

// Thông tin Wifi
const char *ssid = "ssid";         // your wireless network name (SSID)
const char *password = "password"; // your Wi-Fi network password

const int RELAY = 2;                      // Relay 1stconst
char *mqtt_server = "test.mosquitto.org"; // Thông tin MQTT Broker

// Thông tin tin clientID, publishing, subcribing topic. ClientID nên là duy nhất trong tất cả các ứng dụng
// Thay đổi thông tin ở đây tương ứng với thông tin các bạn muốn
const char *clientID = "698ed4c6-dcbf-4bc8-9d53-da66a4f1ab83"; // Random UUID

// const char* outTopic = "mqtt/esp/";
const char *inTopic = "mqtt/esp/test";

WiFiClient espClient;
PubSubClient client(espClient);
char msg[50];
int count = 0;

// Hàm kết nối Wifi
void setup_wifi()
{

  delay(10);
  // We start by connecting to a WiFi network
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
  pinMode(RELAY, OUTPUT);
}

// Hàm call back được gọi khi nhận được thông tin từ subcribing topic
// Trong ứng dụng demo này thì chưa xử lý gì thông tin nhận được
void callback(char *topic, byte *payload, unsigned int length)
{
  // xử lý dữ liệu nhận được
  char *message = (char *)payload;
  Serial.println("Message: %s", message);
}

// Reconnect đến MQTT Broker
void reconnect()
{
  // Loop until we're reconnected
  while (!client.connected())
  {
    Serial.print("Attempting MQTT connection...");
    // Attempt to connect
    if (client.connect(clientID))
    {
      Serial.println("mqtt connected");
      // ... and resubscribe
      client.subscribe(inTopic);
    }
    else
    {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

void setup()
{
  Serial.begin(115200);
  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
}

void loop()
{
  if (!client.connected())
  {
    reconnect();
  }
  client.loop();
}
