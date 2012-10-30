class AddMetricToFriendship < ActiveRecord::Migration
  def change
    add_column :friendships, :metric, :decimal
  end
end
