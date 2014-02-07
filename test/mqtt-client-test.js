var libpath = process.env['CODE_COVERAGE_IOT_AGENT'] ? '../lib-cov' : '../lib';

var expect = require('expect.js'),
	sinon = require('sinon'),
	mqtt = require('mqtt');	

describe('Mqtt Client Tests', function() {
	
	// Define utils and logger for mocks
	var utils = require(libpath +"/utils").init();
	var logger = require(libpath +"/logger").init(utils);

	// Mock sensor-store to return empty list
	var sensorsStore = require(libpath +"/sensors-store");
	var ssStub = sinon.stub(sensorsStore, 'getSensorsList', function(){
		return {};
	});
	// Mock cloud constructor
	var cloud = require(libpath +"/cloud");
	
	var cloudMock = cloud.init(utils.getConfig(), logger, 'testDeviceId', null);
	cloudMock.registrationCompleted = true;
	var initStub = sinon.stub(cloud, 'init', function(){
		return cloudMock;
	});

	after(function(done){		
		ssStub.restore();
		initStub.restore();
		
		done();
	});

	describe('Register new mqtt sensor', function(){

        it('should send registration request', function(done){
        	// Mock cloud.pub to assert data sent to mqtt
        	var initialized = false;
        	var pubStub = sinon.stub(cloudMock, 'pub', function(t,d){
        		console.log("!");
        		if(initialized == false){
	    			initialized = true;
	    		}else{	
	    			expect(d).not.to.be(undefined);
	    			expect(d.sender_id).to.be('testDeviceId');
	    			expect(d.msg_type).to.be('device_registration_msg');
	    			expect(d.service_metadata).to.have.length(1);
	    			expect(d.service_metadata[0].metrics).to.have.length(1);
	    			expect(d.service_metadata[0].metrics[0].units).to.be('Celsius');
	    			expect(d.service_metadata[0].metrics[0].data_type).to.be('float');
	    			expect(d.service_metadata[0].metrics[0].name).to.be('test-sensor');
	    			expect(d.service_metadata[0].metrics[0].items).to.be(1);
	    			
	    			pubStub.restore();
		    		done();	
	    		}
    		});
        	// Start agent
        	var agent = require('../agent.js');
        	        	
        	// Publish sensor registration message
        	var client = mqtt.createClient();
        	client.publish('data', '{"s": "test-sensor", "t": "float", "u": "Celsius"}');
        });
    	
        it('should discard message due to registration incomplete', function(done){
        	cloudMock.registrationCompleted = false;
        	// cloud.pub should not be called 
    		var spyPub = sinon.spy(cloudMock, 'pub');
        	
        	// Start agent
        	var agent = require('../agent.js');
        	
        	// Publish sensor registration message
        	var client = mqtt.createClient();
        	client.publish('data', '{"s": "test-sensor", "t": "float", "u": "Celsius"}');
        	
        	// cloud.pub should not be called
        	sinon.assert.notCalled(spyPub);
        	spyPub.restore();
        	cloudMock.registrationCompleted = true;
        	done();
        });

    	it('should check required parameters', function(done){
        	
        	// cloud.pub should not be called 
    		var spyPub = sinon.spy(cloudMock, 'pub');
        	
        	// Start agent
        	var agent = require('../agent.js');
        	
        	// Publish sensor registration message
        	var client = mqtt.createClient();
        	client.publish('data', '{"s": "test-sensor"}');
        	
        	// cloud.pub should not be called
        	sinon.assert.notCalled(spyPub);
        	spyPub.restore();
        	done();
        });

    	it('should check required parameters', function(done){
        	
        	// cloud.pub should not be called 
    		var spyPub = sinon.spy(cloudMock, 'pub');
        	
        	// Start agent
        	var agent = require('../agent.js');
        	
        	// Publish sensor registration message
        	var client = mqtt.createClient();
        	client.publish('data', '{"s": "test-sensor, "t": "float"}');
        	
        	// cloud.pub should not be called
        	sinon.assert.notCalled(spyPub);
        	spyPub.restore();
        	done();
        });

    	it('should check required parameters', function(done){
        	
        	// cloud.pub should not be called 
    		var spyPub = sinon.spy(cloudMock, 'pub');
        	
        	// Start agent
        	var agent = require('../agent.js');
        	
        	// Publish sensor registration message
        	var client = mqtt.createClient();
        	client.publish('data', '{"s": "test-sensor, "u": "Celsius"}');
        	
        	// cloud.pub should not be called
        	sinon.assert.notCalled(spyPub);
        	spyPub.restore();
        	done();
        });

    	it('should check required parameters', function(done){
        	
        	// cloud.pub should not be called 
    		var spyPub = sinon.spy(cloudMock, 'pub');
        	
        	// Start agent
        	var agent = require('../agent.js');
        	
        	// Publish sensor registration message
        	var client = mqtt.createClient();
        	client.publish('data', '{}');
        	
        	// cloud.pub should not be called
        	sinon.assert.notCalled(spyPub);
        	spyPub.restore();
        	done();
        });
    });
	
	describe('Send metrics from mqtt sensor', function(){

        it('should send metric', function(done){
        	
        	// Mock cloud.pub to assert data sent to mqtt
        	var initialized = false;
        	var pubStub = sinon.stub(cloudMock, 'pub', function(t,d){
        		expect(d).not.to.be(undefined);
    			if(d.msg_type == 'metrics_msg'){
	    			expect(d.sender_id).to.be('testDeviceId');
	    			expect(d.msg_type).to.be('metrics_msg');
	    			expect(d.data_source).to.have.length(1);
	    			expect(d.data_source[0].name).to.be('test-sensor');
	    			expect(d.data_source[0].metrics).to.have.length(1);
	    			expect(d.data_source[0].metrics[0].name).to.be('measure');
	    			expect(d.data_source[0].metrics[0].sample).to.have.length(1);
	    			expect(d.data_source[0].metrics[0].sample[0].value).to.be(123456);	    			
	    			
	    			pubStub.restore();
		    		done();	
	    		}
    		});
        	// Start agent
        	var agent = require('../agent.js');
        	        	
        	// Publish sensor registration message
        	var client = mqtt.createClient();
        	client.publish('data', '{"s": "test-sensor", "t": "float", "u": "Celsius"}');
        	client.publish('data', '{"s": "test-sensor", "m": "measure", "v": 123456}');
        });
        
    	it('should discard message', function(done){
        	
        	// Mock cloud.pub to assert data sent to mqtt
        	var initialized = false;
        	var pubStub = sinon.stub(cloudMock, 'pub', function(t,d){
        		expect(d).not.to.be(undefined);
    			if(d.msg_type == 'metrics_msg'){
	    			expect(d.sender_id).to.be('testDeviceId');
	    			expect(d.msg_type).to.be('metrics_msg');
	    			expect(d.data_source).to.have.length(1);
	    			expect(d.data_source[0].name).to.be('test-sensor');
	    			expect(d.data_source[0].metrics).to.have.length(1);
	    			expect(d.data_source[0].metrics[0].name).to.be('measure');
	    			expect(d.data_source[0].metrics[0].sample).to.have.length(1);
	    			expect(d.data_source[0].metrics[0].sample[0].value).to.be(123456);	    			
	    			
	    			pubStub.restore();
		    		done();	
	    		}
    		});
        	// Start agent
        	var agent = require('../agent.js');
        	        	
        	// Publish sensor registration message
        	var client = mqtt.createClient();
        	client.publish('data', '{"s": "test-sensor", "t": "float", "u": "Celsius"}');
        	client.publish('data', '{"s": "test-sensor", "m": "measure", "v": 123456}');
        });
    	
    	it('should discard message due to registration incomplete', function(done){
        	cloudMock.registrationCompleted = false;
        	// cloud.pub should not be called 
    		var spyPub = sinon.spy(cloudMock, 'pub');
        	
        	// Start agent
        	var agent = require('../agent.js');
        	
        	// Publish sensor registration message
        	var client = mqtt.createClient();
        	client.publish('data', '{"s": "test-sensor", "t": "float", "u": "Celsius"}');
        	client.publish('data', '{"s": "test-sensor", "m": "measure", "v": 123456}');
        	
        	// cloud.pub should not be called
        	sinon.assert.notCalled(spyPub);
        	spyPub.restore();
        	cloudMock.registrationCompleted = true;
        	done();
        });

    	it('should check required parameters', function(done){
        	
        	// cloud.pub should not be called 
    		var spyPub = sinon.spy(cloudMock, 'pub');
        	
        	// Start agent
        	var agent = require('../agent.js');
        	
        	// Publish sensor registration message
        	var client = mqtt.createClient();
        	client.publish('data', '{"s": "test-sensor", "t": "float", "u": "Celsius"}');
        	client.publish('data', '{"s": "test-sensor"}');
        	
        	// cloud.pub should not be called
        	sinon.assert.notCalled(spyPub);
        	spyPub.restore();
        	done();
        });

    	it('should check required parameters', function(done){
        	
        	// cloud.pub should not be called 
    		var spyPub = sinon.spy(cloudMock, 'pub');
        	
        	// Start agent
        	var agent = require('../agent.js');
        	
        	// Publish sensor registration message
        	var client = mqtt.createClient();
        	client.publish('data', '{"s": "test-sensor", "t": "float", "u": "Celsius"}');
        	client.publish('data', '{"s": "test-sensor", "m": "measure"}');
        	
        	// cloud.pub should not be called
        	sinon.assert.notCalled(spyPub);
        	spyPub.restore();
        	done();
        });

    	it('should check required parameters', function(done){
        	
        	// cloud.pub should not be called 
    		var spyPub = sinon.spy(cloudMock, 'pub');
        	
        	// Start agent
        	var agent = require('../agent.js');
        	
        	// Publish sensor registration message
        	var client = mqtt.createClient();
        	client.publish('data', '{"s": "test-sensor", "t": "float", "u": "Celsius"}');
        	client.publish('data', '{"s": "test-sensor", "v": 123456}');
        	
        	// cloud.pub should not be called
        	sinon.assert.notCalled(spyPub);
        	spyPub.restore();
        	done();
        });

    	it('should check required parameters', function(done){
        	
        	// cloud.pub should not be called 
    		var spyPub = sinon.spy(cloudMock, 'pub');
        	
        	// Start agent
        	var agent = require('../agent.js');
        	
        	// Publish sensor registration message
        	var client = mqtt.createClient();
        	client.publish('data', '{"s": "test-sensor", "t": "float", "u": "Celsius"}');
        	client.publish('data', '{}');
        	
        	// cloud.pub should not be called
        	sinon.assert.notCalled(spyPub);
        	spyPub.restore();
        	done();
        });
	});
});
