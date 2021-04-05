
  class Line
    constructor: (@options)->
      if !@options.container
        @options.container= mainContext
      @s= new Surface({
        size:[0, @options.width||2]
        properties:{
          "background-color":@options.color||"pink"
        }
      })
      @move= new Modifier({
        transform: Transform.translate(@options.start[0]||0, @options.start[1]||0)
      })
      @rotate= new StateModifier({
        origin:[0,0]
        })
      @options.container.add(@move).add(@rotate).add(@s)
      @update(@options.start, @options.end)

    update:(start, end)->
      if !start || !end || start[0]==null || start[1]==null || end[0]==null || end[1]==null
        return
      #switch start-end if it's backwards
      if (end[0] - start[0]) < 0
        tmp= JSON.parse(JSON.stringify(start))
        start= JSON.parse(JSON.stringify(end))
        end= tmp
      @move.setTransform(Transform.translate(start[0], start[1]), fns.wall_transition)
      #pythagorean theroem
      delta_x= end[0] - start[0]
      delta_y= end[1] - start[1]
      sum= Math.pow(delta_y,2) + Math.pow(delta_x,2)
      length= parseInt(Math.sqrt(sum))
      #sohcahtoa
      angle = Math.atan(delta_y/delta_x) #* (180/Math.PI);
      #set transitions
      @s.setSize([length, @s.getSize()[1]], fns.wall_transition)
      @rotate.setTransform(Transform.rotateZ(angle), fns.wall_transition)