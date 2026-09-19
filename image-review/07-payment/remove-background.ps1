$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Collections.Generic;
public static class CardBackgroundRemoval {
  public static void Run(string source, string target) {
    using (var input = new Bitmap(source))
    using (var output = new Bitmap(input.Width,input.Height,PixelFormat.Format32bppArgb)) {
      int w=input.Width,h=input.Height;
      var outside=new bool[w*h];
      var queue=new Queue<int>();
      // Flood from the perimeter: blue details enclosed inside the cards stay intact.
      for(int x=0;x<w;x++){queue.Enqueue(x);queue.Enqueue((h-1)*w+x);}
      for(int y=0;y<h;y++){queue.Enqueue(y*w);queue.Enqueue(y*w+w-1);}
      while(queue.Count>0){
        int i=queue.Dequeue(),x=i%w,y=i/w;
        if(outside[i])continue;
        Color c=input.GetPixel(x,y);
        bool belowCards=y>1379-.215*x;
        bool blue=c.B>1.25*c.G && c.R<Math.Max(12,.4*c.G);
        if(!blue || !(c.B>120 && c.G>70 || belowCards))continue;
        outside[i]=true;
        if(x>0)queue.Enqueue(i-1);if(x<w-1)queue.Enqueue(i+1);
        if(y>0)queue.Enqueue(i-w);if(y<h-1)queue.Enqueue(i+w);
      }
      for(int y=0;y<h;y++)for(int x=0;x<w;x++){
        Color c=input.GetPixel(x,y);
        if(!outside[y*w+x]){output.SetPixel(x,y,c);continue;}
        // Recover the photographed shadow as neutral translucent pixels.
        // Normal background variation is removed; the shadow remains soft.
        double shadow=y>1160 ? Math.Max(0,Math.Min(1,(148.0-c.G)/148.0)) : 0;
        shadow=Math.Max(0,(shadow-.045)/.955);
        int alpha=(int)Math.Round(255*shadow);
        output.SetPixel(x,y,Color.FromArgb(alpha,0,8,15));
      }
      output.Save(target,ImageFormat.Png);
    }
  }
}
'@
$root = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path
[CardBackgroundRemoval]::Run(
  (Join-Path $PSScriptRoot 'cedarflow-payment-cards-v1.png'),
  (Join-Path $root 'assets/images/cedarflow-payment-cards-transparent.png')
)
