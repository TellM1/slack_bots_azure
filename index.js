const express = require('express')
const { App } = require("@slack/bolt");
const mysql = require("mysql")
const moment = require('moment');
const fs = require("fs");
const { text } = require('express');
const { exit } = require('process');
const { resolve } = require('path');
const { resourceLimits } = require('worker_threads');
require('dotenv').config();

var conn=mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_UserName,
    password: process.env.MYSQL_Pass,
    database:"kintai_data",
    port:3306,
    ssl:{ca:fs.readFileSync(process.env.MYSQL_caLink)}
  });

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  port: process.env.PORT || 3000
});


// 主な勤怠処理////////////////////////////////////////////////////////////////////
app.message("出勤", async ({ message, say }) => { // 出勤処理
    try {  
        // SQLで使用するデータを管理
        var ids = message.user;
        
        var res = await ins_now(ids,"出勤");
        console.log(res)
        if(res == 0){
          say("出勤処理を行いました。もし事前に処理されている場合は、最初の物が残ります。");
        }else{
          say("すでに処理済みのようです。")
        }
      }catch (error) {
        console.log("err")
        console.error(error);
    }
});

app.message("休憩", async ({ message, say }) => { // 出勤処理
  try {  
      // SQLで使用するデータを管理
      var ids = message.user;
      
      var res = await ins_now(ids,"休憩");
      console.log(res)
      if(res == 0){
        say("休憩処理を行いました。ゆっくり休んでください～");
      }else{
        say("すでに処理済みのようです。")
      }
    }catch (error) {
      console.log("err")
      console.error(error);
  }
});

app.message("再開", async ({ message, say }) => { // 出勤処理
  try {  
      // SQLで使用するデータを管理
      var ids = message.user;
      
      var res = await ins_now(ids,"再開");
      console.log(res)
      if(res == 0){
        say("再開処理を行いました。残りの仕事も頑張って！");
      }else{
        say("すでに処理済みのようです。")
      }
    }catch (error) {
      console.log("err")
      console.error(error);
  }
});

app.message("退勤", async ({ message, say }) => { // 出勤処理
  try {  
      // SQLで使用するデータを管理
      var ids = message.user;
      
      var res = await ins_now(ids,"退勤");
      console.log(res)
      if(res == 0){
        say("退勤処理を行いました。お疲れさまでした！");
      }else{
        say("すでに処理済みのようです。")
      }
    }catch (error) {
      console.log("err")
      console.error(error);
  }
});
////////////////////////////////////////////////////////////////////////////////////
// "hello" を含むメッセージをリッスンします
app.command('/registration', async ({ ack, payload, client, body}) => {
  // Acknowledge shortcut request
  ack();

  try {
    // Call the views.open method using the WebClient passed to listeners
    const result = await client.views.open({
      trigger_id: payload.trigger_id,
      channel: process.env.SLACK_CHANNEL_ID,
      view: {
        "callback_id": "modal_form_regi",
        "type": "modal",
        "title": {
          "type": "plain_text",
          "text": "新規登録",
          "emoji": true
        },
        "submit": {
          "type": "plain_text",
          "text": "Submit",
          "emoji": true,
        },
        "close": {
          "type": "plain_text",
          "text": "Cancel",
          "emoji": true
        },
        "blocks": [
          {
            "type": "divider"
          },
          {
            "dispatch_action": true,
            "type": "input",
            "block_id": "comp_num_block",
            "element": {
              "type": "plain_text_input",
              "dispatch_action_config": {
                "trigger_actions_on": [
                  "on_character_entered"
                ]
              },
            "placeholder": {
                "type": "plain_text",
                "text": "社員番号を入力してください"
            },
            "action_id": "text_input_comp"
            },
            "label": {
              "type": "plain_text",
              "text": "社員番号",
              "emoji": true
            }
          },
          {
            "type": "divider"
          },
          {
            "dispatch_action": true,
            "type": "input",
            "block_id": "input_Name_block",
            "element": {
              "type": "plain_text_input",
              "dispatch_action_config": {
                "trigger_actions_on": [
                  "on_character_entered"
                ]
              },
              "action_id": "Name_input"
            },
            "label": {
              "type": "plain_text",
              "text": "名前",
              "emoji": true
            }
          },
          {
            "type": "divider"
          },
          {
            "dispatch_action": true,
            "type": "input",
            "block_id": "input_Age_block",
            "element": {
              "type": "plain_text_input",
              "dispatch_action_config": {
                "trigger_actions_on": [
                  "on_character_entered"
                ]
              },
              "action_id": "Age_input"
            },
            "label": {
              "type": "plain_text",
              "text": "年齢",
              "emoji": true
            }
          },
          {
            "type": "divider"
          },
          {
            "dispatch_action": true,
            "type": "input",
            "block_id": "input_Email_block",
            "element": {
              "type": "plain_text_input",
              "dispatch_action_config": {
                "trigger_actions_on": [
                  "on_character_entered"
                ]
              },
              "action_id": "Email_input"
            },
            "label": {
              "type": "plain_text",
              "text": "email",
              "emoji": true
            }
          },
          {
            "type": "divider"
          },
          {
            "type": "input",
            "block_id" : "input_Birth_block", 
            "element": {
              "type": "datepicker",
              "initial_date": "2001-05-01",
              "placeholder": {
                "type": "plain_text",
                "text": "誕生日を選択してください",
                "emoji": true
              },
              "action_id": "Birth_input"
            },
            "label": {
              "type": "plain_text",
              "text": "誕生日",
              "emoji": true
            }
          }
        ]
      }
    });

    // console.log(result);
  }
  catch (error) {
    console.error(error);
  }
});

app.view("modal_form_regi", async({ack, view, client, event}) => {
  var comNum = view["state"]["values"]["comp_num_block"]["text_input_comp"]["value"];
  var inputName = view["state"]["values"]["input_Name_block"]["Name_input"]["value"];
  var ages = view["state"]["values"]["input_Age_block"]["Age_input"]["value"];
  var email = view["state"]["values"]["input_Email_block"]["Email_input"]["value"];
  var birthd = view["state"]["values"]["input_Birth_block"]["Birth_input"]["selected_date"];

  console.log("view処理")
 
  console.log({
    comNum,
    email,
    inputName,
    birthd,
    ages
  })
  ack()

  const result = await client.chat.postMessage({
    channel: process.env.SLACK_CHANNEL_ID,
    response_type: 'ephemeral',
    text: `<@${event.name}>Request approved 👍`
  });
});


////////////////////////////////////////////////////////////////////////////////////
// app.command("/registration")

(async () => {
    const port = process.env.PORT || 3000;
    await app.start(port);
    console.log(`⚡️ reacting-bot is running on port ${port}`);
})();

function nowTime(){
    var date = moment().format("MMDD");
    var times = moment().format("HHmm");
    var Month = moment().format("MM");
    var Days = moment().format("DD");
    var Hour = moment().format("HH");
    var Mini = moment().format("mm");
    var times = (Month + "月" + Days + "日" + Hour + "時" + Mini + "分"); 
    return times
}

function ins_now(a,b){
  return new Promise(function(resolve) {
    var nowdate = moment().format("YYYY-MM-DD");
    var nowtime = moment().format("HH:mm");
    try{
      var sqltext = `SELECT COUNT(*) AS ResNum FROM kintai_data.datas WHERE id = '${a}' AND date = '${nowdate}' AND attendance = '${b}'`;
      conn.query(sqltext, (err, result, fields) => {
        if(err){throw err};
        if(result[0].ResNum == 0){
          var sqltext = "INSERT INTO kintai_data.datas SET ?;";
          conn.query(sqltext, { date: nowdate, time: nowtime ,id: a, attendance: b}, (err, result, fields) => {if (err){return err};});
          console.log("処理完了")
          resolve(0)
        }else{
          console.log("重複している")
          resolve(1)
        }});
    }catch(err){
      resolve(2)
    }
})
  
}

function ins_User(a,b,c){
  var cid = a;//会社管理のID
  var uName = b;//日本語名
  var uid = c;//slack管理のID

  var sqltext = "INSERT INTO kintai_data.users_data SET ?;";
  var res = conn.query(sqltext, { id: cid, userName: uName, slackId: uid}, (err, result, fields) => {
    if (err) {return "err"}
    console.log(result)
    console.log(uName + "登録処理");
  });  
}
