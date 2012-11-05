class SearchController < ApplicationController
  def index
    @key_word = params[:keyword]

    if @key_word != nil and @key_word != ''
      redirect_to :action => 'show', :keyword => @key_word
    end

  end
 
  def show
  	@key_word = params[:keyword]
  end

  ############################################
  # The following will be functional actions #
  # and has no corresponding view component	 #
  ############################################

  def fetch_by_keyword
	# Fetch related keywords by the keyword

  	@keyword = params[:keyword]

	if @keyword==nil
		@result = Keyword.all
	else
		@result = Keyword.find_by_name(@keyword)
	end

	# Return in the format of JSON object
	respond_to do |format|
		format.json { render :json => @result }
	end

  end

  def fetch_graph_data
	# Fetch the graph data to feed the Canvas

  	@keyword = params[:keyword]
	if Keyword.find_by_name(@keyword)==nil
		@result = []
	else
		# get the key and its friends
		@key = Keyword.find_by_name(@keyword)
		@friends = @key.friends
		@nodes = [{:keyword => @key.name}]

		# parse into the right format

		@friends.each do |f|
			@nodes += [{:keyword => f.name}]
		end

		@edges = []
		# Generate random data for now
		for i in (0..@nodes.size-1)
			for j in (0..@nodes.size-1)
				if i<j
					@edges += [{:key1 => @nodes[i][:keyword], :key2 => @nodes[j][:keyword], :metric => rand }]
				end
			end
		end

		@result = { :nodes => @nodes, :edges => @edges }

	end

	# Return in the format of JSON object
	respond_to do |format|
		format.json { render :json => @result }
	end


  end


  def fetch_friendship_by_keyword_pairs
  	##### Deprecated method #####
  	# Get the friendship status between two keywords

	@key1 = parames[:key1]
	@key2 = parames[:key2]

  end

  def fetch_page_by_keyword
	# Will fetch related info to the keyword (related pages)
	# For now it wpill only fetch the wiki page

  	@keyword = params[:keyword]

	if Keyword.find_by_name(@keyword)==nil
		@result = {:message => "No such keyword" }
	else
		@result = Keyword.find_by_name(@keyword).webpages
	end

	# Return in the format of JSON object
	respond_to do |format|
		format.json { render :json => @result }
	end
  end

end
