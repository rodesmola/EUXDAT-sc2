<template>
    <div>
        




<v-stepper v-model="e6" vertical color="#4ea852">
    <v-stepper-step :complete="e6 > 1" step="1" color="#4ea852">
      Select an app
      <small>Summarize if needed</small>
    </v-stepper-step>

    <v-stepper-content step="1">
      <!-- <v-card color="#4ea852" class="mb-5" height="200px"></v-card> -->

      <UserPolygons/>
      <!-- <v-btn flat>Cancel</v-btn> -->
      <v-btn color="#4ea852" dark @click="e6 = 2">Continue</v-btn>
      
    </v-stepper-content>

    <v-stepper-step :complete="e6 > 2" step="2">Configure analytics for this app</v-stepper-step>

    <v-stepper-content step="2">
      <!-- <v-card color="grey lighten-1" class="mb-5" height="200px"></v-card> -->



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




      <v-btn color="primary" @click="e6 = 3">Continue</v-btn>
      <v-btn flat @click="e6 = 2">Cancel </v-btn>
    </v-stepper-content>

    <v-stepper-step :complete="e6 > 3" step="3">Select an ad format and name ad unit</v-stepper-step>

    <v-stepper-content step="3">
      <v-card color="grey lighten-1" class="mb-5" height="200px"></v-card>
      <v-btn color="primary" @click="e6 = 4">Continue</v-btn>
      <v-btn flat>Cancel</v-btn>
    </v-stepper-content>

    <v-stepper-step step="4">View setup instructions</v-stepper-step>
    <v-stepper-content step="4">
      <v-card color="grey lighten-1" class="mb-5" height="200px"></v-card>
      <v-btn color="primary" @click="e6 = 1">Continue</v-btn>
      <v-btn flat>Cancel</v-btn>
    </v-stepper-content>
  </v-stepper>

    </div>
</template>

<script>
import { required, numeric, between } from 'vuelidate/lib/validators'
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
      e6: 1,
      cropMonitoringData: {
        startDate: "2020-05-01",
        endDate: "2020-09-12",
        cloudCoverage: 20
      },
      inputDateRules: [
        v => !!v || ''
      ],
      menuStartDate: false,
      menuEndDate: false,        
    }),
    methods: {
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


