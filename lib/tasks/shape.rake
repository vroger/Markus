  # A new rake to generate assignments, random students, submissions and TA data
class Time
  # Return a random Time
  # From http://jroller.com/obie/entry/random_times_for_rails
  def self.random(params={})
    years_back = params[:year_range] || 5
    year = (rand * (years_back)).ceil + (Time.now.year - years_back)
    month = (rand * 12).ceil
    day = (rand * 31).ceil
    series = [date = Time.local(year, month, day)]
    if params[:series]
      params[:series].each do |some_time_after|
        series << series.last + (rand * some_time_after).ceil
      end
      return series
    end
    date
  end

end 





# A new rake to generate ShapeAnnotations  & Points

namespace :markus do
  namespace :simulator do
    desc "Generate Shapes  & Points"
    task(:shape => :environment) do


 



 desc "Creating assignment"

      
      num_of_assignments = Integer(ENV["NUM_OF_ASSIGNMENTS"])
      # If the uer did not provide the environment variable "NUM_OF_ASSIGNMENTS",
      # the simulator will create two assignments
      if ENV["NUM_OF_ASSIGNMENTS"].nil?
        num_of_assignments = 2
      end

      curr_assignment_num = 1
      # This variable is to be put in the assignment short identifier. The
      # usage if this variable will be explained later.
      curr_assignment_num_for_name = 1
      while(curr_assignment_num <= num_of_assignments) do
        puts "start generating assignment #" + curr_assignment_num.to_s + "... "
        assignment_short_identifier = "A" + curr_assignment_num_for_name.to_s
        # There might be other assignemnts' whihc has the same short_identifier
        # as assignment_short_identifier. To solve thsi problem, keep
        # increasing curr_assignment_num_for_name by one till we get a
        # assignment_short_identifier which does not exist in the database.
        while (Assignment.find_by_short_identifier( assignment_short_identifier)) do
          curr_assignment_num_for_name += 1
          assignment_short_identifier = "A" + curr_assignment_num_for_name.to_s
        end

        puts assignment_short_identifier
        assignment = Assignment.create
        rule = NoLateSubmissionRule.new
        assignment.short_identifier = assignment_short_identifier
        assignment.description = "Conditionals and Loops"
        assignment.message = "Learn to use conditional statements, and loops."

        # The default assignemnt_due_date is a randon date whithin six months
        # before and six months after now.
        assignment_due_date = Time.random(:year_range=>1)
        # If the user wants the assignment's due date to be passed, set the
        # assignment_due_date to Time.now.
        if (!ENV["PASSED_DUE_DATE"].nil? and ENV["PASSED_DUE_DATE"] == "true")
          assignment_due_date = Time.now
        # If the user wants the assignemnt's due date to be not passed, then
        # set  assignment_due_date to two months from now.
        elsif (!ENV["PASSED_DUE_DATE"].nil? and ENV["PASSED_DUE_DATE"] == "false")
          assignment_due_date = Time.now + 5184000
        end
        assignment.due_date = assignment_due_date

        assignment.group_min = 1
        assignment.group_max = 1
        assignment.student_form_groups = false
        assignment.group_name_autogenerated = true
        assignment.group_name_displayed = false
        assignment.repository_folder = assignment_short_identifier
        assignment.submission_rule = rule
        assignment.instructor_form_groups = false
        assignment.marking_scheme_type = Assignment::MARKING_SCHEME_TYPE[:rubric]
        assignment.display_grader_names_to_students = false
        assignment.save

	

	group = Group.create
	group.group_name=rand(10)

	group.save

	grouping = Grouping.create
	grouping.assignment_id=assignment.id
	grouping.group_id=group.id
	grouping.save

	date_of_submission = Time.random(:year_range=>1)
	submission = Submission.create_by_timestamp(grouping, date_of_submission)

	submission.save

	submissionfile=SubmissionFile.create
	submissionfile.submission_id=submission.id
	submissionfile.filename='File'
	submissionfile.save


	annotationtext=AnnotationText.create
	annotationtext.save

	annotation=ShapeAnnotation.create
	annotation.annotation_text_id=annotationtext.id
	annotation.submission_file_id=submissionfile.id
	annotation.type='ShapeAnnotation'
	annotation.thickness=rand(10)
	annotation.color='#FF0000'
	annotation.annotation_number=rand(10)
	annotation.save



      num_of_shapes = rand(3) + 3
      curr_shape_num=1
      while(curr_shape_num <= num_of_shapes) do
        curr_assignment_num = 1
        num_of_points = rand(6) + 10
        curr_point_num = 1
          while (curr_point_num <= num_of_points) do

            puts "Start Generating Point # " + curr_assignment_num.to_s + " of Shape # "+ curr_shape_num.to_s
	    point_order = curr_point_num+curr_shape_num
	    point_x=rand(100)
	    point_y=rand(100)

            point=Point.create(:order => point_order,:coord_x => point_x,:coord_y => point_y)


		if !point.save
		puts "Point is not saved"
		end

	    puts "Finish creating Point # " + curr_assignment_num.to_s + " of Shape # "+ curr_shape_num.to_s

	    curr_assignment_num += 1
	    curr_point_num += 1

          end

          puts "Start Generating ShapeAnnotation # "+ curr_shape_num.to_s
	shapeAnnotation = ShapeAnnotation.create
          shapeAnnotation.color = '#FF0000'
	shapeAnnotation.annotation_number=annotation.annotation_number
	shapeAnnotation.annotation_text_id=annotationtext.id

          shapeAnnotation.thickness = rand(5)
	shapeAnnotation.submission_file_id=submissionfile.id


		if !shapeAnnotation.save
		puts "shapeAnnotation is not saved"
		end

          puts "Finish creating ShapeAnnotation # "+ curr_shape_num.to_s
        curr_shape_num += 1
      end
     end
  end
end
end      
