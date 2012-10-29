class Friendship < ActiveRecord::Base
  attr_accessible :friend_id, :keyword_id

  belongs_to :keyword, :class_name => "Keyword", :foreign_key => "keyword_id"
  belongs_to :friend, :class_name => "Keyword", :foreign_key => "friend_id"
end
