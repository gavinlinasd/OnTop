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
		@result = nil # Not found
	else
		@key = Keyword.find_by_name(@keyword.downcase)
		@categories = []

		if @key != nil
			@key.categories.each{ |k| @categories += [k.name] }
			@result = {:name => @key.name, :display_name => @key.display_name, :categories => @categories}
		else
			@result = nil
		end

	end

	# Return in the format of JSON object
	respond_to do |format|
		format.json { render :json => @result }
	end

  end

  def fetch_graph_data
	# Fetch the graph data to feed the Canvas

	# It will take in a list of keywords
  	keywords = params[:keyword]

	@result_list=[]
	for @keyword in keywords

		if Keyword.find_by_name(@keyword)==nil
			# Keyword not found
			@result = {:source => @keyword, :targets => [] }
		else
			# get the key and its friends
			@key = Keyword.find_by_name(@keyword)
			@friends = @key.friends

			# parse into the right format
			@friend_info = []
			@friends.each do |f|
				@friend_info += [{:name => f.name, :display_name => f.display_name}]
			end

			@result = { :source => @keyword, :targets => @friend_info }
		end
		@result_list += [@result]
	end

	# Return in the format of JSON object
	respond_to do |format|
		format.json { render :json => @result_list }
	end

  end


  def fetch_page_by_keyword
	# Will fetch related info to the keyword (related pages)
	# For now it wpill only fetch the wiki page
	# Currently Deprecated

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
