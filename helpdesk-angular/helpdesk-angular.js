/*global require*/
/*
 * Bootstrap and angular-based mashup
 */
/*
 *    Fill in host and port for Qlik engine
 */
var prefix = window.location.pathname.substr( 0, window.location.pathname.toLowerCase().lastIndexOf( "/extensions" ) + 1 );

var config = {
	host: window.location.hostname,
	prefix: prefix,
	port: window.location.port,
	isSecure: window.location.protocol === "https:"
};

require.config( {
	baseUrl: (config.isSecure ? "https://" : "http://" ) + config.host + (config.port ? ":" + config.port : "" ) + config.prefix + "resources",

		 paths: {
		 	helpdeskApp : "/extensions/helpdesk-angular/helpdesk-angular"
		 }

} );

require( ["js/qlik"], function ( qlik ) {
	//qlik app
	var app;
	//data for case listing
	var data = {
		headers: [],
		rows: []
	};


	function getQlikApp () {
		//return qlik.openApp( "4bf04442-aa89-43ff-870a-917c86c92990", config )
		return qlik.openApp( "Helpdesk Management.qvf", config )
	}

	//callbacks -- inserted here --
	function setCases ( reply, app ) {
		data.headers.length = 0;
		data.rows.length = 0;
		//set headers
		reply.qHyperCube.qDimensionInfo.forEach( function ( dim ) {
			data.headers.push( dim.qFallbackTitle );
		} );
		reply.qHyperCube.qMeasureInfo.forEach( function ( mea ) {
			data.headers.push( mea.qFallbackTitle );
		} );
		reply.qHyperCube.qDataPages.forEach( function ( page ) {
			page.qMatrix.forEach( function ( row ) {
				data.rows.push( row );
			} );
		} );
	}
	

	// ARD - COMO FAZER PARA LEVAR OS CONTROLLERS PARA UM OUTRO ARQUIVO?
	// ARD - Tentei chamar o ngResource na linha 65, mas o RequireJS botava erro... Nao entendi o por que disso??
	// 	devo de definir o chamado do ngResource para ele antes em outro lugar?
	
	// MODULE
	var helpdeskApp = angular.module( "helpdeskApp", ['ngRoute'] );
	
	// ROUTES
	helpdeskApp.config( function ( $routeProvider ) {
		$routeProvider.when( '/cases', {
			controller: 'CaseCtrl',
			templateUrl: 'pages/cases.html'
			
		} )
		.when( '/additional-services',{ 
			controller: 'ServicesCtrl',
			templateUrl : 'pages/additional-services.html'

		} )

		.otherwise( {
				controller: 'MainCtrl',
				templateUrl: './main.html'
			} );
	} );
	

	// CONTROLLERS
	// Controller com data direito da Qlik Engine
	helpdeskApp.controller( "MainCtrl", ['$scope', function ( $scope ) {
		if ( !app ) {
			app = getQlikApp();
		}
		//get objects -- inserted here --
		// ARD - Aqui eu consigo isolar dados especificos? Fiquei confuso em como seria feita aquela chamada 
		// dentro do Objeto Nativo da Qlik... Help, please?
		app.getObject( 'QV00', 'CurrentSelections' ).then(function ( obj1 ) {
			console.log( obj1  );
		});
		app.getObject( 'QV01', 'hRZaKk' );
		app.getObject( 'QV02', 'xfvKMP' );
		app.getObject( 'QV03', 'a5e0f12c-38f5-4da9-8f3f-0e4566b28398' );
		app.getObject( 'QV04', 'PAppmU' );


	}] );

	// Controller com data de um Hypercube. Aqui foi bem de boa, para mim ficou claro o conceito
	helpdeskApp.controller( "CaseCtrl", ['$scope', function ( $scope ) {
		if ( !app ) {
			app = getQlikApp();
		}
		//get objects -- inserted here --
		app.getObject( 'QV00', 'CurrentSelections' );
		app.getObject( 'QV04', 'PAppmU' );
	    	app.getObject( 'QV01', 'hRZaKk' );



		app.createCube( {
			"qInitialDataFetch": [
				{
					"qHeight": 400,
					"qWidth": 6
				}
			],
			"qDimensions": [
				{
					"qDef": {"qFieldDefs": ["CaseNumber"]}
				},
				{
					"qDef": {"qFieldDefs": ["Status"]}
				},
				{
					"qDef": {"qFieldDefs": ["Priority"]}
				},
				{
					"qDef": {"qFieldDefs": ["Case Duration Time"]}
				},
				{
					"qDef": {"qFieldDefs": ["Case Owner"]}
				},
				{
					"qDef": {"qFieldDefs": ["Subject"]}
				}
			],
			"qMeasures": [],
			"qSuppressZero": false,
			"qSuppressMissing": false,
			"qMode": "S"
		}, setCases );
		//set up scope headers and rows
		$scope.headers = data.headers;
		$scope.rows = data.rows;

	}] );
	// Controller de terceira pagina
	helpdeskApp.controller( "ServicesCtrl", ['$scope', function ( $scope ) {
		if ( !app ) {
			app = getQlikApp();
		}
		//get objects -- inserted here --
		app.getObject( 'QV00', 'CurrentSelections' );
	    	app.getObject( 'QV02', '298bbd6d-f23d-4469-94a2-df243d680e0c' );
	    	app.getObject( 'QV05', 'rJFbvG' );

	}] );


	// bootstrap my angular application, including the "qlik-angular" module
	// must be done before the Qlik Sense API is used
	// you must also set qva-bootstrap="false" in your html file
	
	require(["angular", "helpdeskApp"], function (angular) {
    	angular.bootstrap( document, ["helpdeskApp", "qlik-angular"] );
  	});


	qlik.setOnError( function ( error ) {
		$( "#errmsg" ).html( error.message ).parent().show();
	} );

	//

} );