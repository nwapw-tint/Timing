
public class MyTimer extends Timer
{
	public MyTimer(int totalSeconds, boolean mode)
	{
		super(totalSeconds, mode);
	}
	
	
	@Override
	protected void printTime(long seconds)
	{
		if (mode == Timer.DOWN)
			seconds = totalSeconds - seconds;
		int m = (int)(seconds / (double)60);
		int h = (int)(seconds / (double)3600);
		int s = (int)(seconds % 60);
		System.out.println(h + ":" + m + ":" + s);
	}

	@Override
	protected void done()
	{
		System.out.println("Done!");
	}
	
	
	public static void main(String[] args)
	{
		new MyTimer(10, Timer.DOWN).start();
	}
}
