import java.util.Calendar;
import java.util.Random;

public class GeoJSONPoint {
		public double mLongitude;
		public double mLatitude;
		public long mTime;
		public int mNumberUbers;
		public int mNumberTaxis;
		public GeoJSONPoint() {
			// Pelham Bay Park 40.712784, -74.005941
			// Some other corner 40.688188, -74.012489
			double minLat = 40.688188;
			double maxLat = 40.712784;
			double minLong = -74.012489;
			double maxLong = -74.005941;
			Random rn = new Random(Calendar.getInstance().getTimeInMillis());
			mLongitude = minLong + (maxLong - minLong) * rn.nextDouble();
			mLatitude = minLat + (maxLat - minLat) * rn.nextDouble();
			
			Calendar cal = Calendar.getInstance();
			cal.add(Calendar.DAY_OF_MONTH, -7);
			mTime = cal.getTimeInMillis();
			
			mNumberUbers = 10 + (rn.nextInt() % 400);
			mNumberTaxis = 10 + (rn.nextInt() % 400);
		}
	}