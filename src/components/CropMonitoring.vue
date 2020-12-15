<template>
  <div>
        
    <v-stepper v-model="step" vertical color="#4ea852">
      <v-stepper-step :complete="step > 1" step="1" color="#4ea852">
        Select a polygon
        <small>You can create a new one</small>
      </v-stepper-step>

      <v-stepper-content step="1">
        <!-- <v-card color="#4ea852" class="mb-5" height="200px"></v-card> -->
        <v-layout row wrap style="text-align: left; padding-top: 8px;">
          <v-flex xs12 class="pl-3 pr-3">
            <UserPolygons/>
          </v-flex>
          <v-flex xs6  offset-xs6 >             
            <v-btn color="#4ea852" dark v-if="isSelected" @click="getPolygonName()">Continue</v-btn>                          
          </v-flex>
          <v-flex xs12 sm12 md12 lg12 v-if="!isSelected" class="green panel-chip">
            <span color="#4ba64f" label>Please select a polygon to start the service.</span>
          </v-flex>         

        </v-layout>
      
      </v-stepper-content>

      <v-stepper-step :complete="step > 2" step="2" color="#4ea852">
        Select time frame and cloud cover
      </v-stepper-step>

      <v-stepper-content step="2">    

        <v-card color="#e0e0e0" class="mb-3" >
          <v-layout row wrap>
            <v-flex xs12 class="pl-3 pr-3 mt-1">
              <v-chip color="#293f47" text-color="white" class="mb-2">{{selectedPolygonName}}</v-chip>
            </v-flex>
          </v-layout>
        </v-card>

        <v-form ref="form" style="margin-top: 10px; margin-bottom: 5px; text-size: 10px;" lazy-validation >
          <v-layout row wrap style="text-align: left; padding-top: 8px;">

            <v-flex xs4 sm6 md6 class="pl-3 pr-3">
              <v-menu ref="menuStartDate" v-model="menuStartDate" :close-on-content-click="false" :nudge-right="40" lazy
              transition="scale-transition" offset-y full-width min-width="290px">
                <template v-slot:activator="{ on }">
                  <v-text-field color="#5cb860" :value="cropMonitoringData.startDate" slot="activator" label="Start date*"
                  :rules="inputDateRules" readonly v-on="on"></v-text-field>
                </template>
                <v-date-picker ref="picker" v-model="cropMonitoringData.startDate" scrollable color="#5cb860" first-day-of-week="1"
                  :max="new Date().toISOString().substr(0, 10)" min="2017-01-01" @change="saveStartDate">
                </v-date-picker>
              </v-menu>
            </v-flex>
            <v-flex xs4 sm6 md6 class="pl-3 pr-3">
              <v-menu ref="menuEndDate" v-model="menuEndDate" :close-on-content-click="false" :nudge-right="40" lazy
              transition="scale-transition" offset-y full-width min-width="290px">
                <template v-slot:activator="{ on }">
                  <v-text-field color="#5cb860" :value="cropMonitoringData.endDate" slot="activator" label="End date*"
                  :rules="inputDateRules" readonly v-on="on"></v-text-field>
                </template>
                <v-date-picker ref="picker" v-model="cropMonitoringData.endDate" scrollable color="#5cb860" first-day-of-week="1"
                  :max="new Date().toISOString().substr(0, 10)" :min="cropMonitoringData.startDate" @change="saveEndDate">
                </v-date-picker>
              </v-menu>
            </v-flex>

            <v-flex xs4 sm7 md7 class="pl-3 pr-3">
              <v-text-field hide-no-data hide-selected dense color="#77b942" type="text" v-model="cropMonitoringData.cloudCoverage" 
                :value="cropMonitoringData.cloudCoverage" label="Cloud coverage (%)" @input="$v.cropMonitoringData.cloudCoverage.$touch()" 
                @blur="$v.cropMonitoringData.cloudCoverage.$touch()" :error-messages="cloudCoverageErrors">
              </v-text-field>                         
            </v-flex>
         
            <v-flex xs4 sm6 md6 >           
              <v-btn flat @click="back(2)" :disabled="isLoading">Back </v-btn>
            </v-flex>
            <v-flex xs4 sm6 md6 >
              <v-btn color="#4ea852" dark :loading="isLoading" @click="getDates()">Continue</v-btn>              
            </v-flex>

          </v-layout>
        </v-form>
        
      </v-stepper-content>

      <v-stepper-step :complete="step > 3" step="3" color="#4ea852">
        Select Sentinel 2 data
      </v-stepper-step>

      <v-stepper-content step="3">
   
        <v-card color="#e0e0e0" class="mb-3" >
          <v-layout row wrap>
            <v-flex xs12 class="pl-3 pr-3">
              <v-chip color="#293f47" text-color="white" class="mb-2">{{selectedPolygonName}}</v-chip>
              <v-divider></v-divider>
            </v-flex>
            <v-flex xs4 class="pl-3 pr-3" style="font-size: 12px">
              <strong>Start date:</strong>
              {{cropMonitoringData.startDate}}
            </v-flex>
            <v-flex xs4 class="pl-3 pr-3" style="font-size: 12px">
              <strong>End date:</strong>
              {{cropMonitoringData.endDate}}
            </v-flex>
            <v-flex xs4 class="pl-3 pr-3" style="font-size: 12px">
              <strong>Cloud coverage:</strong>
              {{cropMonitoringData.cloudCoverage}} %
            </v-flex>
          </v-layout>
        </v-card>

        <v-form ref="form" style="margin-top: 10px; margin-bottom: 5px; text-size: 10px;" lazy-validation >
          <v-layout row wrap style="text-align: left; padding-top: 8px;">
            <v-flex sm6 xs12 md8 >
              <label>Select Sentinel image:</label>
              <v-combobox
                v-model="selectedDate" 
                :items="datesArr"                    
                v-on:change="showLayer()"
                color="green"
              ></v-combobox>
            </v-flex>

            <v-flex xs4 sm6 md6 >   
              <v-btn flat :disabled="isLoading" @click="back(3)">Back</v-btn>
            </v-flex>
            <v-flex xs4 sm6 md6 >   
              <v-btn color="#293f47" :loading="isLoading" :disabled="!isSelectedDate" dark @click="runService()">RUN</v-btn>             
            </v-flex>

          </v-layout>
        </v-form>

      </v-stepper-content>
      
    </v-stepper>


        <!------------ Output dialog ------------>
        <v-dialog v-model="outputDialog" max-width="800">
            <v-card v-if = !isLoading> 
                <v-card-title class="headline">
                  <img style="width: 130px;" src="../assets/logo_titulo.png" alt="">                            
                </v-card-title>

                <v-divider></v-divider>
                <v-card-text>
                  
                <v-layout row wrap >
                  <v-flex xs12 class="pl-3 pr-3 mb-2" style="text-align: center;">
                    <span class="title" style="color: #37aa48; font-size 12px;">
                      <span style="color:#293f47"> Result: </span> {{resultMsg}}
                    </span>                    
                  </v-flex>
                  <v-flex xs12 >
                    <v-divider></v-divider>  
                  </v-flex>
                  <v-flex xs6 class="pl-3 pr-3">
                    <v-list>
              
                      <div v-for="(item, index) in outputData" v-bind:key="index"> 
                      <v-list-tile title="Download file (.tiff)" @click="downloadOutput(item)">
                        <v-list-tile-avatar>
                          <v-icon color="#2b4748">description</v-icon>
                        </v-list-tile-avatar>

                        <v-list-tile-content>
                          <v-list-tile-title >{{item}}</v-list-tile-title>
                        </v-list-tile-content>

                        <v-list-tile-action>
                          <v-icon color="#4ea852">get_app</v-icon>
                        </v-list-tile-action>
                      </v-list-tile>
                        <v-divider></v-divider>  
                      </div>

                    </v-list>
                  </v-flex>
                  <v-flex xs6 class="pl-3 pr-3">
                    <v-list>
              
                      <div v-for="(item, index) in outputData2" v-bind:key="index"> 
                      <v-list-tile title="Download file (.tiff)" @click="downloadOutput(item)">
                        <v-list-tile-avatar>
                          <v-icon color="#2b4748">description</v-icon>
                        </v-list-tile-avatar>

                        <v-list-tile-content>
                          <v-list-tile-title >{{item}}</v-list-tile-title>
                        </v-list-tile-content>

                        <v-list-tile-action>
                          <v-icon color="#4ea852">get_app</v-icon>
                        </v-list-tile-action>
                      </v-list-tile>
                        <v-divider></v-divider>  
                      </div>

                    </v-list>
                  </v-flex>
                </v-layout>

              </v-card-text>
            </v-card>
            <v-card v-if = isLoading>
                <v-card-text style="text-align: center;">
                    <img style="width: 120px;" src="../assets/logo_titulo.png" alt=""><br>
                    <v-progress-circular :size="60" :width="7" color="green" indeterminate style="margin-top: 15px;"></v-progress-circular>
                    <v-flex xs12 style="color: #37aa48; font-size 12px; margin-bottom: 10px; margin-top: 10px;">
                    Processing...
                    </v-flex>
                </v-card-text>
            </v-card>
        </v-dialog>
        <!------------ /Output dialog ------------>

  </div>
</template>

<script>

import { required, numeric, between } from 'vuelidate/lib/validators'
import {Tile as TileLayer} from 'ol/layer.js';
import TileWMS from 'ol/source/TileWMS.js';
import UserPolygons from '@/components/UserPolygons.vue'
import CONST from "../const";

export default {
    name: "PhenologicCurve",
    components: {
      UserPolygons
    },
    props: {},
    data: () => ({
      euxdatURL: CONST.euxdatURL,
      cloudifyURL: CONST.cloudifyURL,
      mundiURL: CONST.mundiURL,
      authHeader: CONST.authHeader,
      step: 1,
      cropMonitoringData: {
        startDate: "2020-05-01",
        endDate: "2020-06-12",
        cloudCoverage: 20
      },
      isLoading: false,
      datesArr: [],
      isSelectedDate: false,
      outputData: [],
      outputData2: [],
      outputDialog: false,
      selectedDate: "",
      isSelected: false,     
      selectedPolygonName: "",
      inputDateRules: [
        v => !!v || ''
      ],
      menuStartDate: false,
      menuEndDate: false,
      resultMsg: ""        
    }),
    methods: {
      getPolygonName(){
        this.selectedPolygonName = this.$store.state.selectedPolygon.get('culture');
        this.step = 2;
      },
      getDates(){        
        var cloud = this.cloudCover;
        this.isLoading = true;
        var selectedPolygonBBOX = this.$store.state.selectedPolygon.getGeometry().getExtent();

        if(this.cropMonitoringData.cloudCoverage.toString() === "100"){
          cloud = "0,99"
        }else{
          cloud = "0,"+this.cropMonitoringData.cloudCoverage.toString();
        }
      
        var url = this.mundiURL.concat('/availabledates?lat_min=', selectedPolygonBBOX[1].toString(),
          '&lat_max=', selectedPolygonBBOX[3].toString(), '&lon_min=', selectedPolygonBBOX[0].toString(), 
          '&lon_max=', selectedPolygonBBOX[2].toString(), '&timeStart=', this.cropMonitoringData.startDate.toString(), 
          '&timeEnd=', this.cropMonitoringData.endDate.toString(), '&cloudCover=', cloud);
    
        this.$http.get(url).then(response => {

          this.datesArr = response.body;
          this.step = 3;
          this.$eventBus.$emit('show-alert', "success", response.statusText);            
          this.isLoading = false;
          
        }, response => {
          this.$eventBus.$emit('show-alert', "error", response.statusText);
        });
   
      },//getDates   
      back(stp){
        if(stp === 3){
          this.selectedDate = "";
          this.$eventBus.$emit('remove-outputLayer', 'raster');
          this.isSelectedDate = false;
        }
        this.step = stp - 1;
      },
      showLayer(){
        if(this.step === 3){
          var map = this.$store.state.map;
          var selectedPolygonBBOX = this.$store.state.selectedPolygon.getGeometry().getExtent();
          this.$eventBus.$emit('remove-outputLayer', 'raster');

          var layer = new TileLayer({
            source: new TileWMS({
              url: 'https://shservices.mundiwebservices.com/ogc/wcs/d275ef59-3f26-4466-9a60-ff837e572144/',
              params: {'SERVICE': 'WCS',
                'REQUEST': 'GetCoverage',
                'BBOX': selectedPolygonBBOX[1].toString().concat(',', selectedPolygonBBOX[0].toString(),
                  ',', selectedPolygonBBOX[3].toString(), ',', selectedPolygonBBOX[2].toString()),
                'MAXCC': '2',
                'COVERAGE': 'B02',
                'FORMAT': 'image/jpeg',
                'TIME': this.selectedDate,
                'RSEX': '20m',
                'RESY': '20m',
                'CRS': 'EPSG:4326'
              },
            })
          })
          layer.set('name', 'raster')
          layer.setZIndex(1);
          map.addLayer(layer)
          this.isSelectedDate = true;
        }
      }, //showLayer      
      /**
      * Get the map layer by name and return it as a OL layer object
      *        
      * @param {string} name
      * @return {object}
      * @public
      */
      getLayerFromMapByName(name){
        var layer;
        this.$store.state.map.getLayers().forEach(function(lyr) {
          if(lyr.get('name') === name){
            layer = lyr;
          }
        });
        return layer;
      },//getLayerFromMapByName   
      runService(){

        var username = this.$store.state.user.preferred_username;
        var deploymentId = this.$store.state.user.preferred_username.slice(2) + '-' + Date.now().toString();
        var url = this.cloudifyURL.concat('deployments/' , deploymentId);        
        var self = this;
        this.outputDialog = true;
        this.isLoading = true; 

        var headers = {
          'Authorization': this.authHeader,
          'Tenant': 'default_tenant'  ,
          'Content-Type': 'application/json'
        };
        var body = {
          'blueprint_id': 'xalkidiki_scenario_v4',
          'inputs': {
            'username': username,
            'process_id': deploymentId,
            'input_timestamp': new Date(this.selectedDate.toString() + 'T00:00:00Z'),
            'input_field_pk': this.$store.state.selectedPolygon.getProperties().pk
          }
        };

        this.$http.put(url, body, {headers}).then(response => {
          url = this.cloudifyURL.concat('executions');
          body = {
            "deployment_id": deploymentId,
            "workflow_id":"install"
          };
          this.$eventBus.$emit('show-alert', "success", response.statusText);
          setTimeout(function(){
            self.$http.post(url, body, {headers}).then(response => {
              
              self.getExecutionStatus(response.body.deployment_id);
            }, response => {
              self.$eventBus.$emit('show-alert', "error", response.statusText);
              self.isLoading = false;
            });
          }, 5000);

        }, response => {
          self.$eventBus.$emit('show-alert', "error", response.statusText);
        });

      },//runService   
      /**
      * Check the running status, if is "terminated" triggerd getGeojson() method
      *
      * @param {string} id
      * @public
      */
      getExecutionStatus(id){

        var self = this;
        var url = this.cloudifyURL.concat("deployments/", id, "/outputs");
        var headers = {
          'Authorization': this.authHeader,
          'Tenant': 'default_tenant'
        };       

        this.$http.get(url, {headers}).then(response => {

          if(response.body.outputs.xalkidiki_scenario_status === null){
            setTimeout(function(){
              self.getExecutionStatus(id);
            }, 3000);
          }else if (response.body.outputs.xalkidiki_scenario_status[0].state.terminated === null){
            setTimeout(function(){
              self.getExecutionStatus(id);
            }, 5000);
          }else{
            if(response.body.outputs.xalkidiki_scenario_status[0].state.terminated.reason === "Completed"){
             self.showResult(response.body.outputs.raster_file_output_path, headers)             
             self.baseDownloadURL = response.body.outputs.raster_file_wms_endpoint
            }else{
              self.$eventBus.$emit('show-alert', "error", response.statusText);
            }
          }

          }, response => {
            self.showAlert("error", response.statusText);
        });

      },//getExecutionStatus       
      showResult(url, headers){

        var self = this;
        this.outputData = []
        this.outputData2 = []

        this.$http.get(url, {headers}).then(response => {

          var i = 0

          Object.keys(response.body).forEach(function(k){
            if(k != "result" && k != "message" && i <= 16){
              k = k.toString().slice(0,k.toString().lastIndexOf('_'));            
              self.outputData.push(k)
            }
            if(k != "result" && k != "message" && i >16){
              k = k.toString().slice(0,k.toString().lastIndexOf('_'));            
              self.outputData2.push(k)
            }
            i++
          })
          this.resultMsg = response.body.message;          
          this.isLoading = false;
          this.$eventBus.$emit('show-alert', "success", response.statusText);
        }, response => {
          this.$eventBus.$emit('show-alert', "error", response.statusText);
          this.isLoading = false;
        });
         
        this.resetForm()
      },
      downloadOutput(fileName){
        window.open(this.baseDownloadURL.concat('result/', fileName, '.tif'), '_blank');
      },
      resetForm(){
        this.selectedDate = "";
        this.$eventBus.$emit('remove-outputLayer', 'raster');
        this.cropMonitoringData = {
          startDate: "2020-05-01",
          endDate: "2020-06-12",
          cloudCoverage: 20
        }        
        this.step = 1
        this.isSelectedDate = false;
      },
      saveStartDate (date) {
        this.$refs.menuStartDate.save(date)
      },
      saveEndDate (date) {
        this.$refs.menuEndDate.save(date)
      },   
    },
    validations: {
      cropMonitoringData:{       
        cloudCoverage: {numeric, required, between: between(0, 100)},          
      }
    },    
    computed: {
      cloudCoverageErrors () {
        const errors = []
        if (!this.$v.cropMonitoringData.cloudCoverage.$dirty) return errors
          !this.$v.cropMonitoringData.cloudCoverage.required && errors.push('Mandatory field')
          !this.$v.cropMonitoringData.cloudCoverage.between && errors.push('Values from 0 to 100')
          !this.$v.cropMonitoringData.cloudCoverage.numeric && errors.push('Insert a number')
          return errors
        }
      },
    watch: {
      menuStartDate (val) {
        val && setTimeout(() => (this.$refs.picker.activePicker = 'YEAR'))
      },
      menuEndDate (val) {
        val && setTimeout(() => (this.$refs.picker.activePicker = 'YEAR'))
      },  
    },
    created(){
      this.$eventBus.$on('is-selected', (bool)  => {      
        this.isSelected = bool      
      });
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.v-input {
	font-size: 12px;
	text-align: left;
}
.v-text-field {
	padding-top: 0px;
	margin-top: 4px;
}

.v-btn--small {
	font-size: 12px;
	height: 20px;
	padding: 0 8px;
  min-width: 58px;
}

.panel-chip {
  padding: 0px;
  text-align: center;
  margin: 5px;
  padding: 2px;
  border-radius: 2px;
  justify-content:
  space-between;
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
}
</style>


