#include <Servo.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <EEPROM.h>

// ================= LCD =================
LiquidCrystal_I2C lcd(0x27, 16, 2);

byte p1[8] = {0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x10};
byte p2[8] = {0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18};
byte p3[8] = {0x1C, 0x1C, 0x1C, 0x1C, 0x1C, 0x1C, 0x1C, 0x1C};
byte p4[8] = {0x1E, 0x1E, 0x1E, 0x1E, 0x1E, 0x1E, 0x1E, 0x1E};
byte p5[8] = {0x1F, 0x1F, 0x1F, 0x1F, 0x1F, 0x1F, 0x1F, 0x1F};

// ================= SERVOS =================
#define SERVO1_PIN 5
#define SERVO2_PIN 6
#define SERVO3_PIN 7
Servo s1, s2, s3; 

#define S1_OPEN 125
#define S1_CLOSE 35
#define S2_OPEN 65
#define S2_CLOSE 6
#define S3_OPEN 65
#define S3_CLOSE 19

unsigned long msFor100g = 1000; 

// ================= BUTTONS =================
#define BTN1 11
#define BTN2 12
#define BTN3 13

// ================= COIN SLOT =================
#define COIN_PIN 2            
#define NEW_COIN_PIN 3       
volatile int pulseCount = 0;
volatile unsigned long lastPulseTime = 0;
bool processingPulses = false;

int pesoBalance = 0;

unsigned long thankYouTimer = 0;
bool systemReady = false;
bool stateInitialized = false; 

enum SystemState {IDLE, CREDIT, DISPENSING, THANKYOU};
SystemState currentState = IDLE;

// ================= HELPERS =================
void writeULongToEEPROM(int addr, unsigned long val){
  for(int i=0; i<4; i++) EEPROM.update(addr+i, (val >> (8*i)) & 0xFF);
}

void coinISR() {
  if(systemReady){
    pulseCount++;
    lastPulseTime = millis();
    processingPulses = true;
  }
}

void processCoinAuto(int pulses){
  int coinValue = 0;
  if(pulses >= 18 && pulses <= 22)      coinValue = 20;
  else if(pulses >= 9 && pulses <= 12)  coinValue = 10;
  else if(pulses >= 4 && pulses <= 7)   coinValue = 5;
  else                                  coinValue = 0; 

  if (coinValue > 0) {
    pesoBalance += coinValue;
  }
}

// ================= UPDATED DISPENSING LOGIC =================
void dispenseExact(int servoNum, int openAngle, int closeAngle) {
  int grams = (pesoBalance * 100) / 5;
  unsigned long totalOpenTime = (pesoBalance * msFor100g) / 5;
  int amountDispensed = pesoBalance;
  
  currentState = DISPENSING;
  lcd.clear();
  lcd.setCursor(0,0);
  lcd.print("Grams: "); 
  lcd.print(grams);
  lcd.print("g (P");
  lcd.print(amountDispensed);
  lcd.print(")");
  
  Servo *selectedServo;
  if(servoNum == 1) { s1.attach(SERVO1_PIN); selectedServo = &s1; }
  else if(servoNum == 2) { s2.attach(SERVO2_PIN); selectedServo = &s2; }
  else { s3.attach(SERVO3_PIN); selectedServo = &s3; }

  // FIX: Force a fast open to overcome rice weight/friction
  selectedServo->write(openAngle);
  delay(50); // Small delay to ensure the pulse is sent immediately
  
  unsigned long startDispense = millis();
  int lastPixels = -1;

  while(millis() - startDispense <= totalOpenTime) {
    unsigned long elapsed = millis() - startDispense;
    int totalPixels = (elapsed * 80) / totalOpenTime;
    
    if(totalPixels != lastPixels) {
      int fullBlocks = totalPixels / 5;
      int partialPixels = totalPixels % 5;
      
      lcd.setCursor(0, 1);
      for(int i=0; i<fullBlocks; i++) lcd.write(5); 
      
      if(fullBlocks < 16) {
        if(partialPixels > 0) lcd.write(partialPixels);
        else lcd.print(" ");
      }
      for(int i=fullBlocks + 1; i<16; i++) lcd.print(" ");
      lastPixels = totalPixels;
    }
  }

  selectedServo->write(closeAngle);
  delay(600); // Increased delay to ensure it closes fully before detaching
  selectedServo->detach();
  
  pesoBalance = 0; 
  currentState = THANKYOU;
  stateInitialized = false; 
  thankYouTimer = millis();
}

// ================= IDLE SCROLL =================
unsigned long lastScroll = 0;
int scrollPos = 0;
String msg = "Welcome to Multi Rice Dispensing System    "; 

void scrollIdle(){
  if(millis() - lastScroll > 200){ 
    lcd.setCursor(0, 0);
    for (int i = 0; i < 16; i++) {
      int charPos = (scrollPos + i) % msg.length();
      lcd.print(msg[charPos]);
    }
    scrollPos++;
    if(scrollPos >= msg.length()) scrollPos = 0;
    lastScroll = millis();
  }
}

void setup(){
  lcd.init();
  lcd.backlight();
  lcd.createChar(1, p1); lcd.createChar(2, p2);
  lcd.createChar(3, p3); lcd.createChar(4, p4);
  lcd.createChar(5, p5);

  pinMode(BTN1, INPUT_PULLUP);
  pinMode(BTN2, INPUT_PULLUP);
  pinMode(BTN3, INPUT_PULLUP);
  pinMode(COIN_PIN, INPUT_PULLUP);
  pinMode(NEW_COIN_PIN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(COIN_PIN), coinISR, FALLING);
  systemReady = true;
  lcd.clear();
}

void loop(){
  if(processingPulses && (millis() - lastPulseTime > 150)){
      int capturedPulses = pulseCount;
      pulseCount = 0;
      processingPulses = false;
      processCoinAuto(capturedPulses);
      if(currentState == IDLE && pesoBalance > 0) {
          currentState = CREDIT;
          stateInitialized = false;
          lcd.clear();
      }
  }

  switch(currentState) {
    case IDLE:
      scrollIdle();
      lcd.setCursor(0, 1);
      lcd.print("  Insert Coin   "); 
      break;

    case CREDIT:
      lcd.setCursor(0, 0);
      lcd.print("Balance: P");
      lcd.print(pesoBalance);
      lcd.print("      "); 
      lcd.setCursor(0, 1);
      lcd.print("  Select Rice   "); 
      
      if(digitalRead(BTN1) == LOW && pesoBalance > 0) dispenseExact(1, S1_OPEN, S1_CLOSE);
      else if(digitalRead(BTN2) == LOW && pesoBalance > 0) dispenseExact(2, S2_OPEN, S2_CLOSE);
      else if(digitalRead(BTN3) == LOW && pesoBalance > 0) dispenseExact(3, S3_OPEN, S3_CLOSE);
      break;

    case THANKYOU:
      if(!stateInitialized) {
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("    SUCCESS!    ");
        lcd.setCursor(0, 1);
        lcd.print("    THANK YOU    ");
        stateInitialized = true;
      }
      if(millis() - thankYouTimer > 3000) {
        currentState = IDLE;
        stateInitialized = false;
        lcd.clear();
      }
      break;
  }
}