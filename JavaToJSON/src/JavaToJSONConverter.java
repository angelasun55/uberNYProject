import java.io.FileNotFoundException;
import java.io.PrintWriter;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Random;

public class JavaToJSONConverter {
	public static ArrayList<GeoJSONPoint> mDataPointSet;
	
	public static void main(String[] args) {
		// TODO Auto-generated method stub
			mDataPointSet = new ArrayList<GeoJSONPoint>();
			
			addFakeDataToDataSet();
		   JSONObject featureCollection = new JSONObject();
		    try {
		        featureCollection.put("type", "featureCollection");
		        JSONArray featureList = new JSONArray();
		        // iterate through your list
		        for (GeoJSONPoint longitude : mDataPointSet) {
		            // {"geometry": {"type": "Point", "coordinates": [-94.149, 36.33]}
		            JSONObject point = new JSONObject();
		            point.put("type", "Point");
		            // construct a JSONArray from a string; can also use an array or list
		            JSONArray coord = new JSONArray("["+longitude.mLatitude+","+longitude.mLongitude+"]");
		            point.put("coordinates", coord);
		            JSONObject feature = new JSONObject();
		            feature.put("geometry", point);
		            featureList.put(feature);
		            featureCollection.put("features", featureList);
		        }
		    } catch (JSONException e) {
		        System.out.println("can't save json object: "+e.toString());
		    }
		    // output the result
		    System.out.println("featureCollection="+featureCollection.toString(4));
		    
		    //Print result to file 
		    printJSONToFile(featureCollection, 
		    		"/Users/cse498/Desktop/OtherApps/UberTaxiNYSite/" +"GeoJSONFake.JSON"
		    		, true);
		    
	}

	public static void printJSONToFile(JSONObject object, String filename, boolean prettyPrint) {
		try {
			PrintWriter writer;
			writer = new PrintWriter(filename, "UTF-8");
			String string = object.toString();
			if (prettyPrint) {
				string = object.toString(4);
			}
			writer.println(string);
			writer.close();
		} catch (FileNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (UnsupportedEncodingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	public static void addFakeDataToDataSet() {
		for (int i = 0; i< 3; i++) {
			mDataPointSet.add(new GeoJSONPoint());
		}
	}
}

