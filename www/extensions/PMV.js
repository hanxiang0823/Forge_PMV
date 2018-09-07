function Calculate_PMV(ta,rH)
{  
  //=======================input=====================//
  //ta = air_temperature;  //or dry bulb temperature
  //rH = relative_Humidity;

  //=================assumed variables===============//
  //svp = saturated_vapour_pressure;
  var c1 = -5.6745359e3;
  var c2 =  6.3925247e0;
  var c3 = -9.677843e-3;
  var c4 =  6.2215701e-7;
  var c5 =  2.0747825e-9;
  var c6 = -9.484024e-13;
  var c7 =  4.1635019e0;

  var c8 = -5.8002206e3;
  var c9 =  1.3914993;
  var c10= -4.8640239e-2;
  var c11=  4.1764768e-5;
  var c12= -1.4452093e-8;
  var c13=  6.5459673;
  t = ta + 273.15;
  if (ta > 0)
  { svp = Math.exp(c8/t+c9+c10*t+c11*t*t+c12*t*t*t+c13*Math.log(t));  }
  else
  { svp = Math.exp(c1/t+c2+c3*t+c4*t*t+c5*t*t*t+c6*t*t*t*t+c7*Math.log(t)); }    
  
  //pvp = partial_vapour_pressure;
  pvp = svp * rH/100.0;

  //M = metabolic_rate;
  M = 1.1;  //typing  (unit:met)
  M = M*58.15;  //convert met to W/m2

  //W = work_done;
  W = 0;  //ironically small in indoor environment

  //Icl = clothing_insulation;
  Icl = 0.5;  //typical summer indoor clothing (unit:clo)
  Icl = Icl*0.155;  //convert clo to m2.K/W

  //fcl = clothing_surface_area_factor;
  if (Icl <= 0.078) 
  { fcl = 1 + 1.29*Icl; }
  else
  { fcl = 1.05 + 0.645*Icl; }

  //tr = mean_radiant_temperature;
  tr = ta;  //assumed same as air temperature

  //va = air_velocity;
  va = 0.1; //indoor environment (unit:m/s)

  //hc = convective_heat_transfer_coefficient;
  hc = 1.0; //initial value for calculation purpose

  //tcl = clothing_surface_temperature;  //(unit:°C)
  tcl = 1.0; //initial value for calculation purpose

  test = 1.0;  //test value of tcl for calculation purpose
  count = 0;
  error = 1.0;
    
  while ((count < 10000)&&(Math.abs(error) > 0.001))
  {
    if (count >= 9999) { alert ("Calculation Error in Clothing Surface Temperature!") ; break; }
    hc = Math.max( 2.38*(Math.pow(Math.abs(test-ta),0.25)) , 12.1*Math.sqrt(va) );
    tcl = 35.7-0.028*(M-W)-Icl*(0.0000000396*fcl*(Math.pow(test+273.0,4)-Math.pow(tr+273.0,4))+fcl*hc*(test-ta));
    error = test - tcl ;
    count = count + 1;
    test = test - error/100;
    /*
    if ( Math.abs(error) >= 1) { test = test - error/10; }
    else if ( Math.abs(error) >= 0.1) { test = test - error/100; }
    	 else  if ( Math.abs(error) >= 0.01) { test = test - error/100000; }
    	 	   else if ( Math.abs(error) >= 0.001) { test = test - error/100000; }
    	 	        else { test = test - error/1000000; }
    */
    /*
    console.log("hc =",hc);
    console.log("tcl =",tcl);
    console.log("test =",test);
    console.log("error =",error);
    console.log("count =",count);
    console.log("--------------------");
    */
    //console.log(count,". error =",error);  
   }

  //=====================output======================//
  PMV = (0.303*Math.exp(-0.036*M)+0.028)*((M-W)-0.00305*(5733-6.99*(M-W)-pvp)-0.42*((M-W)-58.15)-0.000017*M*(5867-pvp)-0.0014*M*(34-ta)-0.0000000396*fcl*(Math.pow(tcl+273.0,4)-Math.pow(tr+273.0,4))-fcl*hc*(tcl-ta)) ;
  PPD = 100-95*Math.exp(-0.03353*Math.pow(PMV,4)-0.2179*Math.pow(PMV,2)) ;
  
  /*
  console.log("ta =",ta);
  console.log("rH =",rH);
  console.log("svp =",svp);
  console.log("pvp =",pvp);
  console.log("Icl =",Icl);
  console.log("va =",va);
  console.log("M =",M);
  console.log("W =",W);
  console.log("fcl =",fcl);
  console.log("tr =",tr);
  console.log("------------------------");
  console.log("hc =",hc);
  console.log("tcl =",tcl);
  console.log("test =",test);
  console.log("error =",error);
  console.log("%error =",error/tcl*100,"%") ;
  console.log("PMV =",PMV);
  console.log("PPD =",PPD);
  console.log("==================================");
  */
  
  return PMV;
  //return PMV,PPD ;
}
