function submitform(){
    const heartRateID = document.getElementById("HeartRate")
     let  heartRate = heartRateID.value;

     const BPID = document.getElementById("BP")
     let BP = BPID.value;

    const now = new Date();
    const date = now.toLocaleDateString();
    const time  = now.toLocaleTimeString();

    const result = `Heart Rate :  ${heartRate} : BP is ${BP}  on ${date} and ${time} `

     const heartRate_show = `${heartRate}`
      const BP_show = `${BP}`
       const date_show = `${date}`
       const  time_show = `${time}`


       
       let bPmessage = '';
      let bPcolor ='';
     
       if(BP>80){
             bPmessage  = 'High'
             bPcolor = 'red'
       }
       else{
        bPmessage = 'Low'
        bPcolor ='green'
       }


       
       

       document.getElementById('heart-rate').innerText += heartRate_show +'\n';
       document.getElementById('Bp-show').innerText  += BP_show +'\n';
       document.getElementById('date-show').innerText += date_show + '\n';
       document.getElementById('time-show').innerText += time_show + '\n';
       document.getElementById('warning-value').innerHTML += `<span style="color:${bPcolor}">${bPmessage}</span><br>`;


    //document.getElementById('result-Box').innerText = result;



}


function clearform() {
    document.getElementById('heart-rate').innerText = '';
    document.getElementById('Bp-show').innerText = '';
    document.getElementById('date-show').innerText = '';
    document.getElementById('time-show').innerText = '';
    document.getElementById('warning-value').innerText = '';
}

function cancelform() {
    document.getElementById('HeartRate').value = '';
    document.getElementById('BP').value = '';
}