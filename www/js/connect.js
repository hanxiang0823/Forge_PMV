/////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Forge Partner Development
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////
$(function () {
    var result= getDatabase();
});

function getDatabase() {
	var result;
  jQuery.ajax({
    url: '/user/connect',
	async: false,
	
    success: function (data) {
	
      //console.log('data:', data.rows[0]);
	  result = [data.rows[0],data.rows[1],data.rows[2],data.rows[3],data.rows[4],data.rows[5],data.rows[6],data.rows[7],data.rows[8],data.rows[9]];
	  
    }
  });
	return result;
}