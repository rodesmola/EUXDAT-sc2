<template>
  <div>
        
    <v-stepper v-model="step" vertical color="#4ea852">
      <v-stepper-step :complete="step > 1" step="1" color="#4ea852">
        Select an app
        <small>Summarize if needed</small>
      </v-stepper-step>

      <v-stepper-content step="1">
        <!-- <v-card color="#4ea852" class="mb-5" height="200px"></v-card> -->
        <UserPolygons/>
        <v-btn color="#4ea852" dark @click="step = 2">Continue</v-btn>      
      </v-stepper-content>

      <v-stepper-step :complete="step > 2" step="2" color="#4ea852">
        Configure analytics for this app
      </v-stepper-step>

      <v-stepper-content step="2">    

        <v-form ref="form" style="margin-top: 10px; margin-bottom: 5px; text-size: 10px;" lazy-validation >
          <v-layout row wrap style="text-align: left; padding-top: 8px;">

            <v-flex xs4 class="pl-3 pr-3">
              <v-menu ref="menuStartDate" v-model="menuStartDate" :close-on-content-click="false" :nudge-right="40" lazy
              transition="scale-transition" offset-y full-width min-width="290px">
                <template v-slot:activator="{ on }">
                  <v-text-field color="#5cb860" :value="cropMonitoringData.startDate" slot="activator" label="Start date*"
                  :rules="inputDateRules" prepend-icon="event" readonly v-on="on"></v-text-field>
                </template>
                <v-date-picker ref="picker" v-model="cropMonitoringData.startDate" scrollable color="#5cb860" first-day-of-week="1"
                  :max="new Date().toISOString().substr(0, 10)" min="2017-01-01" @change="saveStartDate">
                </v-date-picker>
              </v-menu>
            </v-flex>
            <v-flex xs4 class="pl-3 pr-3">
              <v-menu ref="menuEndDate" v-model="menuEndDate" :close-on-content-click="false" :nudge-right="40" lazy
              transition="scale-transition" offset-y full-width min-width="290px">
                <template v-slot:activator="{ on }">
                  <v-text-field color="#5cb860" :value="cropMonitoringData.endDate" slot="activator" label="End date*"
                  :rules="inputDateRules" prepend-icon="event" readonly v-on="on"></v-text-field>
                </template>
                <v-date-picker ref="picker" v-model="cropMonitoringData.endDate" scrollable color="#5cb860" first-day-of-week="1"
                  :max="new Date().toISOString().substr(0, 10)" :min="cropMonitoringData.startDate" @change="saveEndDate">
                </v-date-picker>
              </v-menu>
            </v-flex>

            <v-flex xs4 class="pl-3 pr-3">
              <v-text-field hide-no-data hide-selected dense color="#77b942" type="text" v-model="cropMonitoringData.cloudCoverage" 
                :value="cropMonitoringData.cloudCoverage" label="Cloud coverage (%)" @input="$v.cropMonitoringData.cloudCoverage.$touch()" 
                @blur="$v.cropMonitoringData.cloudCoverage.$touch()" :error-messages="cloudCoverageErrors">
              </v-text-field>                         
            </v-flex>

          </v-layout>
        </v-form>

        <v-btn color="#4ea852" dark @click="getDates()">Continue</v-btn>
        <v-btn flat @click="step = 2">Cancel </v-btn>
      </v-stepper-content>

      <v-stepper-step :complete="step > 3" step="3" color="#4ea852">
        Select an ad format and name ad unit
      </v-stepper-step>

      <v-stepper-content step="3">

        <v-form ref="form" style="margin-top: 10px; margin-bottom: 5px; text-size: 10px;" lazy-validation >
          <v-layout row wrap style="text-align: left; padding-top: 8px;">
            <v-flex sm6 xs12 md8 >
              <v-combobox
                v-model="selectedDate" 
                :items="datesArr"                    
                v-on:change="showLayer()"
                color="green"
              ></v-combobox>
            </v-flex>
          </v-layout>
        </v-form>

        <v-btn color="#4ea852" dark @click="runService()">RUN</v-btn>
        <v-btn flat>Cancel</v-btn>
      </v-stepper-content>
      
    </v-stepper>

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
      datesArr: [],
      selectedDate: "",
      inputDateRules: [
        v => !!v || ''
      ],
      menuStartDate: false,
      menuEndDate: false,        
    }),
    methods: {
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

        }, response => {
          this.$eventBus.$emit('show-alert', "error", response.statusText);
        });
   
      },//getDates      
      showLayer(){

        var map = this.$store.state.map;
        var selectedPolygonBBOX = this.$store.state.selectedPolygon.getGeometry().getExtent();
        map.removeLayer(this.getLayerFromMapByName(map, 'raster'))

        var layer = new TileLayer({
          source: new TileWMS({
            url: 'http://shservices.mundiwebservices.com/ogc/wcs/d275ef59-3f26-4466-9a60-ff837e572144/',
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

        if(map.getView().getZoom() < 9){
          map.getView().setZoom(10)
        }

        layer.set('name', 'raster')
        layer.setZIndex(1);
        map.addLayer(layer)

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
        // this.isLoading = true;
        //var map = this.$store.state.map;

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
   
          setTimeout(function(){
            self.$http.post(url, body, {headers}).then(response => {
              console.log(response.body)
            }, response => {
            self.$eventBus.$emit('show-alert', "error", response.statusText);
            });
          }, 5000);

        }, response => {
          self.$eventBus.$emit('show-alert', "error", response.statusText);
        });


      },//runService           
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


