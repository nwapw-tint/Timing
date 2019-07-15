
public abstract class Timer
{
	public static final boolean UP = false, DOWN = true;
	
	private long secondsPassed, startTime;
	private double currentTime, elapsedTime;
	
	protected boolean mode;
	protected long totalSeconds;
	
	public Timer(int totalSeconds, boolean mode)
	{
		this.totalSeconds = totalSeconds;
		this.mode = mode;
	}
	
	public void start()
	{
		secondsPassed = 0;
		startTime = System.nanoTime();
		
		printTime(0);
		
		while (secondsPassed < totalSeconds)
		{
			currentTime = System.nanoTime();
			elapsedTime = currentTime - startTime;
			if (elapsedTime >= 1000000000)
			{
				startTime += 1000000000;
				printTime(++secondsPassed);
			}
		}
		
		done();
	}
	
	protected abstract void printTime(long seconds);
	
	protected abstract void done();
}
